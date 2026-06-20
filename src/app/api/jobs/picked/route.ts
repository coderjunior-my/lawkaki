import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";
import { formatPickedJob } from "@/lib/jobFormatters";

const JOB_SELECT = `
  id, state, doc_type, venue, address, area,
  appointment_at, fee_indicative, notes,
  map_x, map_y, payment_status,
  poster:users!jobs_poster_id_fkey (id, name, phone, firm_name, firm_state)
`;

// GET /api/jobs/picked — picker's confirmed + awaiting jobs
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  // Confirmed / completed jobs (picker_id = me)
  const { data: confirmed, error: confErr } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("picker_id", userId)
    .neq("state", "cancelled")
    .order("appointment_at", { ascending: true });

  if (confErr) {
    console.error("[GET /api/jobs/picked confirmed]", confErr);
    return NextResponse.json({ error: "Failed to load jobs." }, { status: 500 });
  }

  // Awaiting jobs — interest expressed but no picker confirmed yet
  const { data: myInterests } = await supabase
    .from("job_interests")
    .select("job_id")
    .eq("picker_id", userId);

  const confirmedIds = new Set((confirmed ?? []).map((j: { id: string }) => j.id));
  const awaitingIds  = (myInterests ?? [])
    .map((i: { job_id: string }) => i.job_id)
    .filter((id: string) => !confirmedIds.has(id));

  let awaiting: unknown[] = [];
  if (awaitingIds.length > 0) {
    const { data } = await supabase
      .from("jobs")
      .select(JOB_SELECT)
      .in("id", awaitingIds)
      .in("state", ["open", "urgent"])
      .order("appointment_at", { ascending: true });
    awaiting = data ?? [];
  }

  const jobs = [
    ...(awaiting as { id: string }[]).map((j) => formatPickedJob(j, "awaiting")),
    ...(confirmed ?? []).map((j: { id: string }) => formatPickedJob(j)),
  ];

  return NextResponse.json({ jobs });
}
