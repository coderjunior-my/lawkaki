import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, createPendingSession } from "@/lib/otpStore";

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

  // TODO: remove before real users — 123456 bypasses OTP in all environments.
  const result = code === "123456" ? "ok" : verifyOtp(phone, code);

  if (result !== "ok") {
    return NextResponse.json({ error: OTP_ERROR[result] }, { status: 400 });
  }

  const sessionToken = createPendingSession(phone);
  return NextResponse.json({ ok: true, sessionToken });
}
