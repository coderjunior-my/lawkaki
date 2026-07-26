import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";
import { MALAYSIAN_BANKS } from "@/lib/banks";

const ACCOUNT_NUMBER_RE = /^\d{6,20}$/;

// POST /api/users/bank-details — saves the current user's own bank account
// for receiving payouts. There's no "account holder name" field by design —
// the account is always registered under the logged-in user's own name
// (users.name), so a lawyer can never register someone else's account.
export async function POST(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { bankName, accountNumber } = body as { bankName?: string; accountNumber?: string };

  if (!bankName || !MALAYSIAN_BANKS.includes(bankName as (typeof MALAYSIAN_BANKS)[number])) {
    return NextResponse.json({ error: "Select a valid bank." }, { status: 400 });
  }
  if (!accountNumber || !ACCOUNT_NUMBER_RE.test(accountNumber)) {
    return NextResponse.json({ error: "Enter a valid account number (digits only, 6–20 characters)." }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({ bank_name: bankName, bank_account_number: accountNumber })
    .eq("id", userId);

  if (error) {
    console.error("[POST /api/users/bank-details]", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
