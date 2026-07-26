// Server-only — import only from API routes, never from client components.
// Toggle flags via environment variables (see .env.local.example).

export const flags = {
  // Skip real OTP generation; accept 123456 as the valid code. Keep true during dev/pilot.
  mockOtp: process.env.FEATURE_MOCK_OTP !== "false",

  // Send OTP via WhatsApp instead of logging to console. Requires mockOtp=false.
  whatsappOtp: process.env.FEATURE_WHATSAPP_OTP === "true",

  // Send interest, confirmation, new-job-broadcast and appointment-reminder
  // notifications via WhatsApp. When false, these events still get written
  // to the notifications table — only the WhatsApp leg is skipped.
  whatsappNotifications: process.env.FEATURE_WHATSAPP_NOTIFICATIONS === "true",
} as const;
