import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/supabase";
import { completeJob } from "@/lib/jobActions";

// POST /api/jobs/complete — poster marks a taken job as done
export async function POST(req: NextRequest) {
  const token    = req.headers.get("authorization")?.replace("Bearer ", "");
  const posterId = token ? await getUserIdFromToken(token) : null;
  if (!posterId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { jobId } = body as { jobId?: string };
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required." }, { status: 400 });
  }

  const result = await completeJob(jobId, posterId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
