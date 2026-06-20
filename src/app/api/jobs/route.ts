import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatBrowseJob } from "@/lib/jobFormatters";

// GET /api/jobs — all active jobs for the browse map + list
export async function GET() {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id, state, doc_type, venue, address, area,
      appointment_at, fee_indicative, notes,
      map_x, map_y, distance_text, duration_text,
      poster:users!jobs_poster_id_fkey (id, name, phone, firm_name, firm_state),
      picker:users!jobs_picker_id_fkey (id, name)
    `)
    .in("state", ["open", "urgent", "taken"])
    .order("appointment_at", { ascending: true });

  if (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json({ error: "Failed to load jobs." }, { status: 500 });
  }

  return NextResponse.json({ jobs: (jobs ?? []).map(formatBrowseJob) });
}
