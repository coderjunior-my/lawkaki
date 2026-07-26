import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";

// GET /api/users/me — lightweight profile flags for gating UI (critical
// notices, role-aware views), not the full profile record.
export async function GET(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("role, bank_name, bank_account_number, bank_account_holder_name")
    .eq("id", userId)
    .single();

  if (error || !user) {
    console.error("[GET /api/users/me]", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }

  return NextResponse.json({
    role: user.role,
    bankDetailsAdded: Boolean(user.bank_account_number),
    bankDetails: user.bank_account_number ? {
      bankName:          user.bank_name,
      accountNumber:     user.bank_account_number,
      accountHolderName: user.bank_account_holder_name,
    } : null,
  });
}
