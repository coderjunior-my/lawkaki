import { supabase } from "@/lib/supabase";

const OTP_TTL_MS             = 5  * 60 * 1_000;
const MAX_OTP_ATTEMPTS       = 3;
const PENDING_SESSION_TTL_MS = 10 * 60 * 1_000;

export async function storeOtp(phone: string, code: string): Promise<void> {
  // Delete stale OTPs for this phone before inserting a fresh one
  await supabase.from("otp_tokens").delete().eq("phone", phone);
  await supabase.from("otp_tokens").insert({
    phone,
    code,
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<"ok" | "expired" | "wrong" | "locked"> {
  const { data } = await supabase
    .from("otp_tokens")
    .select("id, code, expires_at, attempts")
    .eq("phone", phone)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return "expired";

  if (new Date(data.expires_at) < new Date()) {
    await supabase.from("otp_tokens").delete().eq("id", data.id);
    return "expired";
  }

  if (data.attempts >= MAX_OTP_ATTEMPTS) return "locked";

  if (data.code !== code) {
    await supabase
      .from("otp_tokens")
      .update({ attempts: data.attempts + 1 })
      .eq("id", data.id);
    return "wrong";
  }

  await supabase.from("otp_tokens").update({ used: true }).eq("id", data.id);
  return "ok";
}

export async function createPendingSession(phone: string): Promise<string> {
  const token = crypto.randomUUID();
  await supabase.from("pending_sessions").insert({
    token,
    phone,
    expires_at: new Date(Date.now() + PENDING_SESSION_TTL_MS).toISOString(),
  });
  return token;
}

export async function consumePendingSession(token: string): Promise<string | null> {
  const { data } = await supabase
    .from("pending_sessions")
    .select("phone, expires_at")
    .eq("token", token)
    .single();

  if (!data) return null;

  await supabase.from("pending_sessions").delete().eq("token", token);

  if (new Date(data.expires_at) < new Date()) return null;

  return data.phone as string;
}
