import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyInterestReminder } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";
import { createNotification } from "@/lib/notifications";

// POST /api/cron/sweep — hourly sweep, triggered by Supabase pg_cron/pg_net
// (see schema.sql). Two jobs:
//   1. Interests: day-3 / day-7 reminders, day-9 expiry.
//   2. Jobs: 30 days idle (open/urgent, never taken) → expired.

const DAY = 24 * 60 * 60 * 1000;
const MYT = "Asia/Kuala_Lumpur";

const INTEREST_SELECT = `
  id, job_id, expressed_at, confirm_code,
  picker:users!job_interests_picker_id_fkey (name),
  job:jobs!job_interests_job_id_fkey (
    venue, doc_type, appointment_at,
    poster:users!jobs_poster_id_fkey (id, name, phone)
  )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendReminders(rows: any[], stage: 1 | 2) {
  for (const row of rows) {
    const job    = Array.isArray(row.job) ? row.job[0] : row.job;
    const picker = Array.isArray(row.picker) ? row.picker[0] : row.picker;
    const poster = job && (Array.isArray(job.poster) ? job.poster[0] : job.poster);
    if (!job || !poster || !picker) continue;

    const appt = new Date(job.appointment_at);
    const date = appt.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", timeZone: MYT });
    const time = appt.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: MYT });

    let whatsappSent = false;
    if (flags.whatsappNotifications) {
      whatsappSent = await notifyInterestReminder({
        posterPhone:     poster.phone,
        posterFirstName: poster.name.split(" ")[0],
        pickerName:      picker.name,
        venue:   job.venue,
        docType: job.doc_type,
        date, time,
        confirmCode: row.confirm_code,
        stage,
      }).then(() => true).catch((err) => {
        console.error("[WhatsApp] interest reminder failed:", err);
        return false;
      });
    }

    const nudge = stage === 1
      ? `${picker.name} is still waiting on your confirmation`
      : `Last call to confirm ${picker.name}`;
    await createNotification({
      userId: poster.id,
      jobId: row.job_id, type: "interest_reminder", role: "poster",
      title: nudge,
      body:  `${job.venue} · ${job.doc_type} · ${time}, ${date}`,
      whatsappSent,
    });

    await supabase
      .from("job_interests")
      .update({ [stage === 1 ? "reminder_3d_sent_at" : "reminder_7d_sent_at"]: new Date().toISOString() })
      .eq("id", row.id);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || auth !== secret) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const now  = Date.now();
  const day3 = new Date(now - 3 * DAY).toISOString();
  const day7 = new Date(now - 7 * DAY).toISOString();
  const day9 = new Date(now - 9 * DAY).toISOString();

  // Stage 1 reminder (day 3)
  const { data: stage1 } = await supabase
    .from("job_interests")
    .select(INTEREST_SELECT)
    .eq("status", "pending")
    .is("reminder_3d_sent_at", null)
    .lte("expressed_at", day3);
  await sendReminders(stage1 ?? [], 1);

  // Stage 2 reminder (day 7)
  const { data: stage2 } = await supabase
    .from("job_interests")
    .select(INTEREST_SELECT)
    .eq("status", "pending")
    .not("reminder_3d_sent_at", "is", null)
    .is("reminder_7d_sent_at", null)
    .lte("expressed_at", day7);
  await sendReminders(stage2 ?? [], 2);

  // Expiry (day 9) — job itself stays open/urgent, only this interest goes stale
  const { data: expired } = await supabase
    .from("job_interests")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lte("expressed_at", day9)
    .select("id");

  // Idle job expiry (30 days, never taken)
  const thirtyDaysAgo = new Date(now - 30 * DAY).toISOString();
  const { data: expiredJobs } = await supabase
    .from("jobs")
    .update({ state: "expired" })
    .in("state", ["open", "urgent"])
    .lt("created_at", thirtyDaysAgo)
    .select("id");

  return NextResponse.json({
    ok: true,
    remindersStage1: (stage1 ?? []).length,
    remindersStage2: (stage2 ?? []).length,
    interestsExpired: (expired ?? []).length,
    jobsExpired: (expiredJobs ?? []).length,
  });
}
