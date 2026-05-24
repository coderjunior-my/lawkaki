import { NextRequest, NextResponse } from "next/server";
import { storeOtp } from "@/lib/otpStore";

const VALID_MY_MOBILE = /^\+601\d{7,9}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { phone } = body as { phone?: string };

  if (!phone || !VALID_MY_MOBILE.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid Malaysian mobile number." },
      { status: 400 }
    );
  }

  const code = Math.floor(100_000 + Math.random() * 900_000).toString();
  storeOtp(phone, code);

  // TODO: Send via Twilio WhatsApp API or 360dialog.
  // Template: "Your Law Kaki code is {{1}}. Valid for 5 minutes."
  // In development the code is logged to the server console.
  console.log(`[OTP] ${phone} → ${code}`);

  return NextResponse.json({ ok: true });
}
