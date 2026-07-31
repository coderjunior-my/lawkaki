import { NextRequest, NextResponse } from "next/server";
import { confirmPickerForInterest } from "@/lib/jobActions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { jobId, pickerPhone } = body as {
    jobId?:       string;
    pickerName?:  string;
    pickerPhone?: string;
  };

  if (!jobId || !pickerPhone) {
    return NextResponse.json(
      { error: "jobId and pickerPhone are required." },
      { status: 400 },
    );
  }

  const result = await confirmPickerForInterest({ jobId, pickerPhone });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
