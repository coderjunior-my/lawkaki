import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserIdFromToken } from "@/lib/supabase";

// POST /api/users/bank-details — marks the current user's bank details as
// added. Deliberately just a completion flag, not a place to store real
// account numbers (see schema.sql — Phase 1 has no platform-mediated
// payments, so there's no need to hold that PII yet).
export async function POST(req: NextRequest) {
  const token  = req.headers.get("authorization")?.replace("Bearer ", "");
  const userId = token ? await getUserIdFromToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { error } = await supabase
    .from("users")
    .update({ bank_details_added: true })
    .eq("id", userId);

  if (error) {
    console.error("[POST /api/users/bank-details]", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
