import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";
import { formatPostedJob } from "@/lib/jobFormatters";

// GET /api/jobs/posted — poster's own jobs with interested pickers
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id, state, doc_type, venue, address, area,
      appointment_at, fee_indicative, notes,
      map_x, map_y, distance_text, duration_text,
      picker:users!jobs_picker_id_fkey (id, name)
    `)
    .eq("poster_id", userId)
    .neq("state", "cancelled")
    .order("appointment_at", { ascending: true });

  if (error) {
    console.error("[GET /api/jobs/posted]", error);
    return NextResponse.json({ error: "Failed to load jobs." }, { status: 500 });
  }

  const jobIds = (jobs ?? []).map((j: { id: string }) => j.id);

  // Fetch interests + picker ratings for all posted jobs in two parallel queries
  const [interestRes, ratingRes] = await Promise.all([
    jobIds.length > 0
      ? supabase
          .from("job_interests")
          .select(`
            id, job_id, expressed_at,
            picker:users!job_interests_picker_id_fkey (id, name, phone, firm_name, firm_state)
          `)
          .in("job_id", jobIds)
          .order("expressed_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),

    jobIds.length > 0
      ? supabase
          .from("picker_ratings")
          .select("picker_id, total_jobs, avg_rating, avg_punctuality, avg_professionalism, avg_completeness")
          // filter to pickers who expressed interest in these jobs (fetched below)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interests = (interestRes.data ?? []) as any[];

  // Build a map of picker_id → rating
  const pickerIds = [...new Set(interests.map((i) => {
    const p = Array.isArray(i.picker) ? i.picker[0] : i.picker;
    return p?.id;
  }).filter(Boolean))];
  let ratingMap: Record<string, unknown> = {};
  if (pickerIds.length > 0) {
    const { data: ratings } = await supabase
      .from("picker_ratings")
      .select("picker_id, total_jobs, avg_rating, avg_punctuality, avg_professionalism, avg_completeness")
      .in("picker_id", pickerIds);
    for (const r of ratings ?? []) {
      ratingMap[r.picker_id] = r;
    }
  }

  // Group interests by job_id and attach ratings
  const byJob: Record<string, unknown[]> = {};
  for (const int of interests) {
    const pickerObj = Array.isArray(int.picker) ? int.picker[0] : int.picker;
    const pickerId  = pickerObj?.id;
    const enriched  = { ...int, picker: pickerObj, rating: pickerId ? ratingMap[pickerId] : null };
    (byJob[int.job_id] ??= []).push(enriched);
  }

  const formatted = (jobs ?? []).map((j: { id: string }) =>
    formatPostedJob(j, byJob[j.id] ?? []),
  );

  return NextResponse.json({ jobs: formatted });
}
