import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";
import { initials, parseApptAt } from "@/lib/jobFormatters";

// GET /api/reviews/pending — completed jobs the caller hasn't reviewed yet,
// from either side (poster rating picker, or picker rating poster).
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const [postedRes, pickedRes] = await Promise.all([
    supabase
      .from("jobs")
      .select(`
        id, venue, doc_type, fee_indicative, appointment_at,
        picker:users!jobs_picker_id_fkey (name)
      `)
      .eq("poster_id", userId)
      .eq("state", "completed"),
    supabase
      .from("jobs")
      .select(`
        id, venue, doc_type, fee_indicative, appointment_at,
        poster:users!jobs_poster_id_fkey (name)
      `)
      .eq("picker_id", userId)
      .eq("state", "completed"),
  ]);

  const postedJobs = postedRes.data ?? [];
  const pickedJobs = pickedRes.data ?? [];
  const jobIds = [...postedJobs.map((j) => j.id), ...pickedJobs.map((j) => j.id)];

  const { data: existingRatings } = jobIds.length > 0
    ? await supabase.from("ratings").select("job_id, rater_role").in("job_id", jobIds)
    : { data: [] as { job_id: string; rater_role: string }[] };

  const alreadyRated = new Set((existingRatings ?? []).map((r) => `${r.job_id}:${r.rater_role}`));

  const pending = [
    ...postedJobs
      .filter((j) => !alreadyRated.has(`${j.id}:poster`))
      .map((j) => {
        const picker = Array.isArray(j.picker) ? j.picker[0] : j.picker;
        return {
          id: j.id,
          venue: j.venue,
          docType: j.doc_type,
          dateLabel: parseApptAt(j.appointment_at).dateLabel,
          fee: j.fee_indicative,
          role: "poster" as const,
          counterparty: { name: picker?.name ?? "Unknown", initials: initials(picker?.name ?? null) },
        };
      }),
    ...pickedJobs
      .filter((j) => !alreadyRated.has(`${j.id}:picker`))
      .map((j) => {
        const poster = Array.isArray(j.poster) ? j.poster[0] : j.poster;
        return {
          id: j.id,
          venue: j.venue,
          docType: j.doc_type,
          dateLabel: parseApptAt(j.appointment_at).dateLabel,
          fee: j.fee_indicative,
          role: "picker" as const,
          counterparty: { name: poster?.name ?? "Unknown", initials: initials(poster?.name ?? null) },
        };
      }),
  ];

  return NextResponse.json({ reviews: pending });
}
