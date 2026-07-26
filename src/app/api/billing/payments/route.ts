import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";

// GET /api/billing/payments — the poster's payment history (all statuses),
// each with the transactions it covers, for the collapsible history view.
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: payments, error } = await supabase
    .from("platform_payments")
    .select(`
      id, method, total_amount, reference, status, submitted_at, reviewed_at,
      transactions:fee_transactions!fee_transactions_payment_id_fkey (
        id, amount, job:jobs!fee_transactions_job_id_fkey (venue, doc_type, appointment_at)
      )
    `)
    .eq("poster_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[GET /api/billing/payments]", error);
    return NextResponse.json({ error: "Failed to load payment history." }, { status: 500 });
  }

  return NextResponse.json({
    payments: (payments ?? []).map((p) => ({
      id:            p.id,
      method:        p.method,
      totalAmount:   p.total_amount,
      reference:     p.reference,
      status:        p.status,
      submittedAt:   p.submitted_at,
      reviewedAt:    p.reviewed_at,
      transactions: (p.transactions ?? []).map((t) => {
        const job = Array.isArray(t.job) ? t.job[0] : t.job;
        return {
          id: t.id, amount: t.amount,
          venue: job?.venue ?? null, docType: job?.doc_type ?? null, appointmentAt: job?.appointment_at ?? null,
        };
      }),
    })),
  });
}

// POST /api/billing/payments — poster submits a batch of unpaid transactions
// for review. Creates a 'pending' platform_payments row and attaches the
// selected transactions to it; nothing is marked paid yet — see
// /api/admin/payments/[id]/confirm.
export async function POST(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { transactionIds, method } = body as { transactionIds?: string[]; method?: string };

  if (!transactionIds?.length) {
    return NextResponse.json({ error: "Select at least one transaction to pay." }, { status: 400 });
  }
  if (method === "payment_gateway") {
    return NextResponse.json({ error: "Payment gateway isn't available yet — use bank transfer." }, { status: 400 });
  }

  const { data: txns, error: txnError } = await supabase
    .from("fee_transactions")
    .select("id, amount, status, poster_id, payment_id")
    .in("id", transactionIds);

  if (txnError || !txns?.length) {
    return NextResponse.json({ error: "Transactions not found." }, { status: 404 });
  }
  // payment_id already set means it's sitting in another payment awaiting
  // review — must be rejected first (which clears it) before it can be
  // resubmitted, otherwise the same fee could end up double-submitted.
  const invalid = txns.some((t) => t.poster_id !== userId || t.status !== "unpaid" || t.payment_id !== null);
  if (invalid || txns.length !== transactionIds.length) {
    return NextResponse.json({ error: "One or more transactions aren't available to pay." }, { status: 409 });
  }

  const totalAmount = txns.reduce((sum, t) => sum + t.amount, 0);

  const { data: payment, error: payError } = await supabase
    .from("platform_payments")
    .insert({ poster_id: userId, method: "bank_transfer", total_amount: totalAmount })
    .select("id, status, submitted_at")
    .single();

  if (payError || !payment) {
    console.error("[POST /api/billing/payments]", payError);
    return NextResponse.json({ error: "Failed to submit payment." }, { status: 500 });
  }

  await supabase
    .from("fee_transactions")
    .update({ payment_id: payment.id })
    .in("id", transactionIds);

  return NextResponse.json({ ok: true, payment });
}
