import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyAppointmentReminder } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";
import { createNotification } from "@/lib/notifications";

// POST /api/cron/reminders — polled every 5 minutes by Supabase pg_cron/pg_net
// (see schema.sql). Fires a one-time 2h and 30m reminder per confirmed
// ("taken") job, to both the picker and the poster.
//
// This runs on its own tight schedule separately from the hourly
// /api/cron/sweep, which handles interest lifecycle (reminders/expiry) on a
// day-scale clock and would be far too coarse for a 30-minute window.

const MIN  = 60 * 1000;
const MYT  = "Asia/Kuala_Lumpur";

const REMINDER_SELECT = `
  id, venue, doc_type, appointment_at,
  picker:users!jobs_picker_id_fkey (id, name, phone),
  poster:users!jobs_poster_id_fkey (id, name, phone)
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendStage(rows: any[], stage: "2h" | "30m") {
  for (const row of rows) {
    const picker = Array.isArray(row.picker) ? row.picker[0] : row.picker;
    const poster = Array.isArray(row.poster) ? row.poster[0] : row.poster;
    if (!picker || !poster) continue;

    const time = new Date(row.appointment_at).toLocaleTimeString("en-MY", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: MYT,
    });

    let whatsappSent = false;
    if (flags.whatsappNotifications) {
      whatsappSent = await notifyAppointmentReminder({
        pickerPhone:     picker.phone,
        pickerFirstName: picker.name.split(" ")[0],
        posterPhone:     poster.phone,
        posterFirstName: poster.name.split(" ")[0],
        venue:   row.venue,
        docType: row.doc_type,
        time, stage,
      }).then(() => true).catch((err) => {
        console.error("[WhatsApp] appointment reminder failed:", err);
        return false;
      });
    }

    const title = stage === "2h" ? "2 hrs to go" : "30 mins to go";
    await Promise.all([
      createNotification({
        userId: picker.id, jobId: row.id, type: `appointment_reminder_${stage}`, role: "picker",
        title, body: `${row.venue} · ${time}`, whatsappSent,
      }),
      createNotification({
        userId: poster.id, jobId: row.id, type: `appointment_reminder_${stage}`, role: "poster",
        title, body: `${picker.name.split(" ")[0]} is covering ${row.venue}, ${time}.`, whatsappSent,
      }),
    ]);

    await supabase
      .from("jobs")
      .update({ [stage === "2h" ? "reminder_2h_sent_at" : "reminder_30m_sent_at"]: new Date().toISOString() })
      .eq("id", row.id);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || auth !== secret) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const now      = Date.now();
  const in30Min  = new Date(now + 30 * MIN).toISOString();
  const in2Hours = new Date(now + 120 * MIN).toISOString();
  const nowIso   = new Date(now).toISOString();

  // 2h stage — skip jobs already inside the 30m window so a late-confirmed
  // job doesn't get a nonsensical "2 hrs to go" moments before it starts.
  const { data: stage2h } = await supabase
    .from("jobs")
    .select(REMINDER_SELECT)
    .eq("state", "taken")
    .is("reminder_2h_sent_at", null)
    .gt("appointment_at", in30Min)
    .lte("appointment_at", in2Hours);
  await sendStage(stage2h ?? [], "2h");

  // 30m stage
  const { data: stage30m } = await supabase
    .from("jobs")
    .select(REMINDER_SELECT)
    .eq("state", "taken")
    .is("reminder_30m_sent_at", null)
    .gt("appointment_at", nowIso)
    .lte("appointment_at", in30Min);
  await sendStage(stage30m ?? [], "30m");

  return NextResponse.json({
    ok: true,
    remindersStage2h: (stage2h ?? []).length,
    remindersStage30m: (stage30m ?? []).length,
  });
}
