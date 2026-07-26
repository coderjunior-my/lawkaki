// Job + interest mutations shared by the web API routes, the WhatsApp
// inbound webhook, and the cron sweep — one code path for each state
// transition instead of one copy per caller.

import { supabase } from "@/lib/supabase";
import { notifyConfirmation, notifyNewJob } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";
import { createNotification } from "@/lib/notifications";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

const MYT = "Asia/Kuala_Lumpur";

function fmtApptDateTime(iso: string) {
  const appt = new Date(iso);
  return {
    date: appt.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", timeZone: MYT }),
    time: appt.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: MYT }),
  };
}

// ─── Create ───────────────────────────────────────────────────────────────

export async function createJob(posterId: string, fields: {
  docType:        string;
  venue:          string;
  address:        string;
  area?:          string;
  appointmentAt:  string; // ISO
  feeIndicative:  number;
  notes?:         string;
}): Promise<ActionResult<{ id: string }>> {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      poster_id:      posterId,
      state:          "open",
      doc_type:       fields.docType,
      venue:          fields.venue,
      address:        fields.address,
      area:           fields.area ?? null,
      appointment_at: fields.appointmentAt,
      fee_indicative: fields.feeIndicative,
      notes:          fields.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createJob]", error);
    return { ok: false, status: 500, error: "Failed to create job." };
  }

  broadcastNewJob(data.id as string, posterId, fields).catch((err) =>
    console.error("[broadcastNewJob]", err),
  );

  return { ok: true, data: { id: data.id as string } };
}

// Fan out a freshly-posted job to every eligible Picker. Phase 1 has no
// persisted coverage-area/availability preferences server-side (the toggles
// in Settings.tsx are local UI state only), so "eligible" simply means every
// active user who can pick — area-based targeting is a Phase 2 refinement
// once those preferences are actually stored.
async function broadcastNewJob(
  jobId: string,
  posterId: string,
  fields: { docType: string; venue: string; area?: string; appointmentAt: string; feeIndicative: number },
): Promise<void> {
  const { data: pickers, error } = await supabase
    .from("users")
    .select("id, phone")
    .eq("status", "active")
    .in("role", ["picker", "both"])
    .neq("id", posterId);

  if (error || !pickers?.length) return;

  const { date, time } = fmtApptDateTime(fields.appointmentAt);
  const title = fields.area ? `New job in ${fields.area}` : "New job posted";
  const body  = `${fields.venue} · ${fields.docType} · RM${fields.feeIndicative} · ${time}, ${date}`;

  await Promise.all(pickers.map(async (picker) => {
    let whatsappSent = false;
    if (flags.whatsappNotifications) {
      whatsappSent = await notifyNewJob({
        pickerPhone: picker.phone as string,
        venue:       fields.venue,
        docType:     fields.docType,
        area:        fields.area,
        fee:         fields.feeIndicative,
        date, time,
      }).then(() => true).catch((err) => {
        console.error("[WhatsApp] new job broadcast failed:", err);
        return false;
      });
    }
    await createNotification({
      userId: picker.id as string,
      jobId, type: "new_job_broadcast", role: "picker",
      title, body, whatsappSent,
    });
  }));
}

// ─── Interest ─────────────────────────────────────────────────────────────

function generateConfirmCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4 digits
}

// Records (or returns the existing) confirm code for a picker's interest in
// a job — the code a poster can reply "CONFIRM <code>" to on WhatsApp.
export async function recordInterest(jobId: string, pickerId: string): Promise<{ confirmCode: string } | null> {
  const { data: existing } = await supabase
    .from("job_interests")
    .select("confirm_code")
    .eq("job_id", jobId)
    .eq("picker_id", pickerId)
    .maybeSingle();
  if (existing?.confirm_code) return { confirmCode: existing.confirm_code as string };

  for (let attempt = 0; attempt < 3; attempt++) {
    const confirmCode = generateConfirmCode();
    const { data, error } = await supabase
      .from("job_interests")
      .upsert(
        { job_id: jobId, picker_id: pickerId, confirm_code: confirmCode },
        { onConflict: "job_id,picker_id" },
      )
      .select("confirm_code")
      .single();
    if (!error && data) return { confirmCode: data.confirm_code as string };
    // 23505 = unique violation on confirm_code — try a fresh code; anything else, bail.
    if (!(error && (error as { code?: string }).code === "23505")) return null;
  }
  return null;
}

// ─── Confirm ──────────────────────────────────────────────────────────────

// Shared by the web "Confirm X for this job" button and the WhatsApp
// "CONFIRM <code>" reply. Resolve the picker either by id (webhook, from
// the job_interests row) or by phone (web, from the picker profile modal).
export async function confirmPickerForInterest(opts: {
  jobId:       string;
  pickerId?:   string;
  pickerPhone?: string;
}): Promise<ActionResult> {
  const { data: job } = await supabase
    .from("jobs")
    .select(`
      id, state, venue, doc_type, appointment_at,
      poster:users!jobs_poster_id_fkey (name, phone)
    `)
    .eq("id", opts.jobId)
    .single();

  if (!job) return { ok: false, status: 404, error: "Job not found." };
  if (job.state !== "open" && job.state !== "urgent") {
    return { ok: false, status: 409, error: "This job is no longer available to confirm." };
  }

  type PickerRow = { id: string; name: string; phone: string };
  let picker: PickerRow | null = null;
  if (opts.pickerId) {
    const { data } = await supabase.from("users").select("id, name, phone").eq("id", opts.pickerId).single();
    picker = data as PickerRow | null;
  } else if (opts.pickerPhone) {
    const { data } = await supabase.from("users").select("id, name, phone").eq("phone", opts.pickerPhone).single();
    picker = data as PickerRow | null;
  }
  if (!picker) return { ok: false, status: 404, error: "Picker not found." };

  await supabase
    .from("jobs")
    .update({ state: "taken", picker_id: picker.id, picked_at: new Date().toISOString() })
    .eq("id", opts.jobId);

  // Everyone else who expressed interest is no longer in the running — decline
  // their interest so it drops off the poster's card and stops collecting
  // reminder pings / auto-expiring in the cron sweep.
  await supabase
    .from("job_interests")
    .update({ status: "declined" })
    .eq("job_id", opts.jobId)
    .eq("status", "pending")
    .neq("picker_id", picker.id);

  const poster = Array.isArray(job.poster) ? job.poster[0] : job.poster;

  if (flags.whatsappNotifications && poster) {
    const { date, time } = fmtApptDateTime(job.appointment_at);
    notifyConfirmation({
      pickerPhone:     picker.phone,
      pickerFirstName: picker.name.split(" ")[0],
      posterPhone:     poster.phone,
      posterFirstName: poster.name.split(" ")[0],
      venue:   job.venue,
      docType: job.doc_type,
      date, time,
    }).catch((err) => console.error("[WhatsApp] confirm notify failed:", err));
  } else {
    console.log(`[Confirm] ${picker.name} confirmed for job ${opts.jobId}`);
  }

  return { ok: true, data: undefined };
}

// ─── Cancel / Complete ────────────────────────────────────────────────────

export async function cancelJob(jobId: string, posterId: string): Promise<ActionResult> {
  const { data: job } = await supabase.from("jobs").select("id, state, poster_id").eq("id", jobId).single();
  if (!job) return { ok: false, status: 404, error: "Job not found." };
  if (job.poster_id !== posterId) return { ok: false, status: 403, error: "Not your job." };
  if (job.state !== "open" && job.state !== "urgent") {
    return { ok: false, status: 409, error: `Job is already ${job.state}.` };
  }
  await supabase.from("jobs").update({ state: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", jobId);
  return { ok: true, data: undefined };
}

export async function completeJob(jobId: string, posterId: string): Promise<ActionResult> {
  const { data: job } = await supabase.from("jobs").select("id, state, poster_id").eq("id", jobId).single();
  if (!job) return { ok: false, status: 404, error: "Job not found." };
  if (job.poster_id !== posterId) return { ok: false, status: 403, error: "Not your job." };
  if (job.state !== "taken") return { ok: false, status: 409, error: "Only a taken job can be marked complete." };
  await supabase.from("jobs").update({ state: "completed", completed_at: new Date().toISOString() }).eq("id", jobId);
  return { ok: true, data: undefined };
}

// ─── Reviews ──────────────────────────────────────────────────────────────

// Poster rates picker, or picker rates poster — same three dimensions
// either way. rater_role is derived from which party the caller is, never
// trusted from the request body.
export async function submitRating(opts: {
  jobId:           string;
  raterId:         string;
  punctuality:     number;
  professionalism: number;
  completeness:    number;
  note?:           string;
}): Promise<ActionResult> {
  const { data: job } = await supabase
    .from("jobs")
    .select("id, state, poster_id, picker_id")
    .eq("id", opts.jobId)
    .single();

  if (!job) return { ok: false, status: 404, error: "Job not found." };
  if (job.state !== "completed") return { ok: false, status: 409, error: "This job isn't marked complete yet." };

  const raterRole =
    job.poster_id === opts.raterId ? "poster" :
    job.picker_id === opts.raterId ? "picker" :
    null;
  if (!raterRole) return { ok: false, status: 403, error: "You weren't part of this job." };

  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("job_id", opts.jobId)
    .eq("rater_role", raterRole)
    .maybeSingle();
  if (existing) return { ok: false, status: 409, error: "You've already reviewed this job." };

  const { error } = await supabase.from("ratings").insert({
    job_id:          opts.jobId,
    poster_id:       job.poster_id,
    picker_id:       job.picker_id,
    rater_role:      raterRole,
    punctuality:     opts.punctuality,
    professionalism: opts.professionalism,
    completeness:    opts.completeness,
    note:            opts.note ?? null,
  });

  if (error) {
    console.error("[submitRating]", error);
    return { ok: false, status: 500, error: "Failed to submit review." };
  }
  return { ok: true, data: undefined };
}
