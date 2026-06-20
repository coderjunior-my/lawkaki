import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, createPendingSession } from "@/lib/otpStore";
import { findUserByPhone } from "@/lib/mockUsers";
import { supabase } from "@/lib/supabase";
import { flags } from "@/lib/featureFlags";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1_000; // 30 days

const OTP_ERROR: Record<string, string> = {
  expired: "That code has expired. Request a new one.",
  wrong:   "Wrong code. Try again.",
  locked:  "Too many attempts. Request a new code.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { phone, code } = body as { phone?: string; code?: string };

  if (!phone || !code) {
    return NextResponse.json({ error: "Phone and code are required." }, { status: 400 });
  }

  const result =
    flags.mockOtp && code === "123456" ? "ok" : await verifyOtp(phone, code);

  if (result !== "ok") {
    return NextResponse.json({ error: OTP_ERROR[result] }, { status: 400 });
  }

  const existing = await findUserByPhone(phone);
  if (existing) {
    const token = crypto.randomUUID();
    await supabase.from("sessions").insert({
      user_id:    existing.id,
      token,
      expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    });
    return NextResponse.json({
      ok: true, existing: true,
      token, userId: existing.id, name: existing.name,
    });
  }

  const sessionToken = await createPendingSession(phone);
  return NextResponse.json({ ok: true, existing: false, sessionToken });
}
