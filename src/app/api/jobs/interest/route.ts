import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyPosterOfInterest } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";
import { recordInterest } from "@/lib/jobActions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { jobId, pickerName, pickerPhone } = body as {
    jobId?:       string;
    pickerName?:  string;
    pickerPhone?: string;
  };

  if (!jobId || !pickerName || !pickerPhone) {
    return NextResponse.json(
      { error: "jobId, pickerName and pickerPhone are required." },
      { status: 400 },
    );
  }

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      id, state, venue, doc_type, appointment_at,
      poster:users!jobs_poster_id_fkey (name, phone)
    `)
    .eq("id", jobId)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  if (job.state !== "open" && job.state !== "urgent") {
    return NextResponse.json({ error: "This job is no longer available." }, { status: 409 });
  }

  // Record interest (with a confirm code for the WhatsApp reply) if picker has an account
  const { data: picker } = await supabase
    .from("users")
    .select("id")
    .eq("phone", pickerPhone)
    .single();

  const interest = picker ? await recordInterest(jobId, picker.id) : null;

  const poster = Array.isArray(job.poster) ? job.poster[0] : job.poster;

  if (flags.whatsappNotifications && poster && interest) {
    const appt = new Date(job.appointment_at);
    notifyPosterOfInterest({
      posterPhone:     poster.phone,
      posterFirstName: poster.name.split(" ")[0],
      pickerName,
      venue:    job.venue,
      docType:  job.doc_type,
      date:     appt.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" }),
      time:     appt.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kuala_Lumpur" }),
      confirmCode: interest.confirmCode,
    }).catch((err) => console.error("[WhatsApp] interest notify failed:", err));
  } else {
    console.log(`[Interest] ${pickerName} (${pickerPhone}) → job ${jobId}`);
  }

  return NextResponse.json({ ok: true });
}
