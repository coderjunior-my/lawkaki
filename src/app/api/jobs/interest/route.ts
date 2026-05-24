import { NextRequest, NextResponse } from "next/server";
import { JOBS } from "@/lib/jobs";
import { notifyPosterOfInterest } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { jobId, pickerName, pickerPhone } = body as {
    jobId?: string;
    pickerName?: string;
    pickerPhone?: string;
  };

  if (!jobId || !pickerName || !pickerPhone) {
    return NextResponse.json(
      { error: "jobId, pickerName and pickerPhone are required." },
      { status: 400 },
    );
  }

  const job = JOBS.find((j) => j.id === jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  if (job.state === "taken") {
    return NextResponse.json({ error: "This job is no longer available." }, { status: 409 });
  }

  // TODO: persist interest to DB
  // await db.interests.create({ jobId, pickerPhone, createdAt: new Date() });

  if (flags.whatsappNotifications) {
    await notifyPosterOfInterest({
      posterPhone:     job.poster.phone,
      posterFirstName: job.poster.name.split(" ")[0],
      pickerName,
      venue:           job.venue,
      docType:         job.docType,
      date:            job.dateMeta,
      time:            job.time,
    });
  } else {
    console.log(
      `[Interest] ${pickerName} (${pickerPhone}) → job ${jobId} (poster: ${job.poster.name})`,
    );
  }

  return NextResponse.json({ ok: true });
}
