import { NextRequest, NextResponse } from "next/server";
import { supabase, requireAdmin } from "@/lib/supabase";

// POST /api/admin/payments/[id]/reject — admin didn't see the transfer
// land (wrong amount, never arrived, etc). Clears payment_id off the
// covered transactions so the poster can select and resubmit them.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const adminId = await requireAdmin(token);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const { data: payment } = await supabase.from("platform_payments").select("id, status").eq("id", id).single();
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "pending") {
    return NextResponse.json({ error: `Payment is already ${payment.status}.` }, { status: 409 });
  }

  await supabase.from("fee_transactions").update({ payment_id: null }).eq("payment_id", id);

  await supabase
    .from("platform_payments")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
