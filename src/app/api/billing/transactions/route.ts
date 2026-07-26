import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";
import { BALANCE_THRESHOLD_RM } from "@/lib/billing";

// GET /api/billing/transactions — the poster's fee transactions (unpaid +
// paid) plus a summary of what's owed. isDueNow reflects either the
// individual 7-day due date or the RM1,000 running-balance threshold,
// whichever fires first — the threshold is computed live from the current
// unpaid sum, never stored.
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("fee_transactions")
    .select(`
      id, amount, status, due_at, created_at, payment_id,
      job:jobs!fee_transactions_job_id_fkey (id, venue, doc_type, appointment_at, area)
    `)
    .eq("poster_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/billing/transactions]", error);
    return NextResponse.json({ error: "Failed to load transactions." }, { status: 500 });
  }

  const unpaid = (rows ?? []).filter((r) => r.status === "unpaid");
  const totalUnpaid = unpaid.reduce((sum, r) => sum + r.amount, 0);
  const thresholdExceeded = totalUnpaid > BALANCE_THRESHOLD_RM;
  const now = Date.now();

  const transactions = (rows ?? []).map((r) => {
    const job = Array.isArray(r.job) ? r.job[0] : r.job;
    const overdue = r.status === "unpaid" && new Date(r.due_at).getTime() < now;
    return {
      id:         r.id,
      amount:     r.amount,
      status:     r.status,
      dueAt:      r.due_at,
      createdAt:  r.created_at,
      paymentId:  r.payment_id,
      isDueNow:   r.status === "unpaid" && (overdue || thresholdExceeded),
      job: job ? {
        id: job.id, venue: job.venue, docType: job.doc_type,
        appointmentAt: job.appointment_at, area: job.area,
      } : null,
    };
  });

  return NextResponse.json({
    transactions,
    summary: {
      totalUnpaid,
      unpaidCount: unpaid.length,
      thresholdExceeded,
      threshold: BALANCE_THRESHOLD_RM,
    },
  });
}
