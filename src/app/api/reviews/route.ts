import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/supabase";
import { submitRating } from "@/lib/jobActions";

// POST /api/reviews — submit a rating (poster→picker or picker→poster)
export async function POST(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { jobId, punctuality, professionalism, completeness, note } = body as {
    jobId?:           string;
    punctuality?:     number;
    professionalism?: number;
    completeness?:    number;
    note?:            string;
  };

  const dims = [punctuality, professionalism, completeness];
  if (!jobId || dims.some((d) => typeof d !== "number" || d < 1 || d > 5)) {
    return NextResponse.json(
      { error: "jobId and punctuality/professionalism/completeness (1-5 each) are required." },
      { status: 400 },
    );
  }

  const result = await submitRating({
    jobId, raterId: userId,
    punctuality: punctuality!, professionalism: professionalism!, completeness: completeness!,
    note,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
