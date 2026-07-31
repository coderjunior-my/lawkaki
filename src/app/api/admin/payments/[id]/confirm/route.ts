import { NextRequest, NextResponse } from "next/server";
import { supabase, requireAdmin } from "@/lib/supabase";

// POST /api/admin/payments/[id]/confirm — admin confirms a bank transfer
// actually landed. Flips the payment to 'confirmed' and every transaction
// it covers to 'paid'.
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

  await supabase
    .from("platform_payments")
    .update({ status: "confirmed", reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq("id", id);

  await supabase.from("fee_transactions").update({ status: "paid" }).eq("payment_id", id);

  return NextResponse.json({ ok: true });
}
