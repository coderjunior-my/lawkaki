import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /api/billing/export — CSV of the poster's fee transactions, for
// reconciliation outside the app. One row per completed job's platform fee.
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("fee_transactions")
    .select(`
      id, amount, status, due_at, created_at,
      job:jobs!fee_transactions_job_id_fkey (venue, doc_type, appointment_at),
      payment:platform_payments!fee_transactions_payment_id_fkey (id, status, submitted_at, reviewed_at)
    `)
    .eq("poster_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/billing/export]", error);
    return NextResponse.json({ error: "Failed to export." }, { status: 500 });
  }

  const header = [
    "Job venue", "Document type", "Appointment date", "Fee (RM)",
    "Transaction status", "Due date", "Payment ID", "Payment status", "Payment submitted", "Payment reviewed",
  ];

  const lines = [header.join(",")];
  for (const r of rows ?? []) {
    const job     = Array.isArray(r.job) ? r.job[0] : r.job;
    const payment = Array.isArray(r.payment) ? r.payment[0] : r.payment;
    lines.push([
      csvCell(job?.venue ?? ""),
      csvCell(job?.doc_type ?? ""),
      csvCell(job?.appointment_at ?? ""),
      csvCell(r.amount),
      csvCell(r.status),
      csvCell(r.due_at),
      csvCell(payment?.id ?? ""),
      csvCell(payment?.status ?? ""),
      csvCell(payment?.submitted_at ?? ""),
      csvCell(payment?.reviewed_at ?? ""),
    ].join(","));
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lawkaki-billing-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
