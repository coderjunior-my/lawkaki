import { NextRequest, NextResponse } from "next/server";
import { JOBS } from "@/lib/jobs";
import { notifyConfirmation } from "@/lib/whatsapp";
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
    return NextResponse.json({ error: "This job is already taken." }, { status: 409 });
  }

  // TODO: update job state in DB
  // await db.jobs.update({ id: jobId }, { state: "taken", pickerId: pickerId, pickedAt: new Date() });

  if (flags.whatsappNotifications) {
    await notifyConfirmation({
      pickerPhone,
      pickerFirstName: pickerName.split(" ")[0],
      posterPhone:     job.poster.phone,
      posterFirstName: job.poster.name.split(" ")[0],
      venue:           job.venue,
      docType:         job.docType,
      date:            job.dateMeta,
      time:            job.time,
    });
  } else {
    console.log(
      `[Confirm] ${pickerName} confirmed for job ${jobId} — notifying both parties`,
    );
  }

  return NextResponse.json({ ok: true });
}
