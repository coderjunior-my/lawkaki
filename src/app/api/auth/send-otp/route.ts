import { NextRequest, NextResponse } from "next/server";
import { storeOtp } from "@/lib/otpStore";
import { sendOtp } from "@/lib/whatsapp";
import { flags } from "@/lib/featureFlags";

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

  if (flags.whatsappOtp) {
    await sendOtp(phone, code);
  } else {
    console.log(`[OTP] ${phone} → ${code}`);
  }

  return NextResponse.json({ ok: true });
}
