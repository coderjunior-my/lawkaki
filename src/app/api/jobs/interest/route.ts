import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyPosterOfInterest } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";

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
  if (job.state === "taken" || job.state === "completed" || job.state === "cancelled") {
    return NextResponse.json({ error: "This job is no longer available." }, { status: 409 });
  }

  // Record interest if picker has an account
  const { data: picker } = await supabase
    .from("users")
    .select("id")
    .eq("phone", pickerPhone)
    .single();

  if (picker) {
    await supabase
      .from("job_interests")
      .upsert(
        { job_id: jobId, picker_id: picker.id },
        { onConflict: "job_id,picker_id", ignoreDuplicates: true },
      );
  }

  const poster = Array.isArray(job.poster) ? job.poster[0] : job.poster;

  if (flags.whatsappNotifications && poster) {
    const appt = new Date(job.appointment_at);
    await notifyPosterOfInterest({
      posterPhone:     poster.phone,
      posterFirstName: poster.name.split(" ")[0],
      pickerName,
      venue:    job.venue,
      docType:  job.doc_type,
      date:     appt.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" }),
      time:     appt.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kuala_Lumpur" }),
    });
  } else {
    console.log(`[Interest] ${pickerName} (${pickerPhone}) → job ${jobId}`);
  }

  return NextResponse.json({ ok: true });
}
