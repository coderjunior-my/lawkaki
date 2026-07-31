import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";
import { formatBrowseJob } from "@/lib/jobFormatters";
import { createJob } from "@/lib/jobActions";

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

// POST /api/jobs — poster creates a new job
export async function POST(req: NextRequest) {
  const token   = req.headers.get("authorization")?.replace("Bearer ", "");
  const posterId = token ? await getUserIdFromToken(token) : null;
  if (!posterId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { docType, venue, address, area, appointmentAt, feeIndicative, notes } = body as {
    docType?:       string;
    venue?:         string;
    address?:       string;
    area?:          string;
    appointmentAt?: string;
    feeIndicative?: number;
    notes?:         string;
  };

  if (!docType || !venue || !address || !appointmentAt || feeIndicative == null) {
    return NextResponse.json(
      { error: "docType, venue, address, appointmentAt and feeIndicative are required." },
      { status: 400 },
    );
  }
  if (Number.isNaN(new Date(appointmentAt).getTime())) {
    return NextResponse.json({ error: "appointmentAt must be a valid date." }, { status: 400 });
  }
  if (typeof feeIndicative !== "number" || feeIndicative < 0) {
    return NextResponse.json({ error: "feeIndicative must be a non-negative number." }, { status: 400 });
  }

  const result = await createJob(posterId, { docType, venue, address, area, appointmentAt, feeIndicative, notes });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, jobId: result.data.id });
}
