// In-memory OTP + session store for Phase 1 pilot.
// Replace with DB-backed calls (schema.sql: otp_tokens, sessions) before production.

interface OtpEntry {
  code: string;
  expiresAt: number;  // ms timestamp
  attempts: number;
}

interface PendingSession {
  phone: string;
  createdAt: number;  // ms timestamp
}

const otpStore      = new Map<string, OtpEntry>();
const sessionStore  = new Map<string, PendingSession>();

// OTP is valid for 5 minutes; locked after 3 wrong attempts.
const OTP_TTL_MS      = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;

// The pending session (between OTP verify and registration) is valid for 10 minutes.
const PENDING_SESSION_TTL_MS = 10 * 60 * 1000;

export function storeOtp(phone: string, code: string): void {
  otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
}

export function verifyOtp(phone: string, code: string): "ok" | "expired" | "wrong" | "locked" {
  const entry = otpStore.get(phone);
  if (!entry) return "expired";
  if (Date.now() > entry.expiresAt) { otpStore.delete(phone); return "expired"; }
  if (entry.attempts >= MAX_OTP_ATTEMPTS) return "locked";
  if (entry.code !== code) { entry.attempts++; return "wrong"; }
  otpStore.delete(phone);
  return "ok";
}

// Creates a short-lived token that gates the /register endpoint.
export function createPendingSession(phone: string): string {
  const token = crypto.randomUUID();
  sessionStore.set(token, { phone, createdAt: Date.now() });
  return token;
}

// Validates and consumes the pending session (one-time use).
export function consumePendingSession(token: string): string | null {
  const entry = sessionStore.get(token);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > PENDING_SESSION_TTL_MS) {
    sessionStore.delete(token);
    return null;
  }
  sessionStore.delete(token);
  return entry.phone;
}
