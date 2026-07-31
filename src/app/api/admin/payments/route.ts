import { NextRequest, NextResponse } from "next/server";
import { supabase, requireAdmin } from "@/lib/supabase";

// GET /api/admin/payments — every payment submission (default: pending
// only) with the poster and covered transactions, for manual bank-transfer
// reconciliation. Phase 1 has no payment gateway, so this is the only
// place a submitted payment actually gets confirmed or rejected.
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!(await requireAdmin(token))) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "pending";

  let query = supabase
    .from("platform_payments")
    .select(`
      id, method, total_amount, reference, status, submitted_at, reviewed_at,
      poster:users!platform_payments_poster_id_fkey (name, phone, firm_name),
      transactions:fee_transactions!fee_transactions_payment_id_fkey (
        id, amount, job:jobs!fee_transactions_job_id_fkey (venue, doc_type, appointment_at)
      )
    `)
    .order("submitted_at", { ascending: true });

  if (status !== "all") query = query.eq("status", status);

  const { data: payments, error } = await query;
  if (error) {
    console.error("[GET /api/admin/payments]", error);
    return NextResponse.json({ error: "Failed to load payments." }, { status: 500 });
  }

  return NextResponse.json({
    payments: (payments ?? []).map((p) => {
      const poster = Array.isArray(p.poster) ? p.poster[0] : p.poster;
      return {
        id: p.id, method: p.method, totalAmount: p.total_amount, reference: p.reference,
        status: p.status, submittedAt: p.submitted_at, reviewedAt: p.reviewed_at,
        poster: poster ? { name: poster.name, phone: poster.phone, firmName: poster.firm_name } : null,
        transactions: (p.transactions ?? []).map((t) => {
          const job = Array.isArray(t.job) ? t.job[0] : t.job;
          return { id: t.id, amount: t.amount, venue: job?.venue ?? null, docType: job?.doc_type ?? null };
        }),
      };
    }),
  });
}
