// Server-only — import only from API routes, never from client components.
// Toggle flags via environment variables (see .env.local.example).

export const flags = {
  // Send OTP via WhatsApp instead of logging to console.
  whatsappOtp: process.env.FEATURE_WHATSAPP_OTP === "true",

  // Send interest + confirmation notifications via WhatsApp.
  whatsappNotifications: process.env.FEATURE_WHATSAPP_NOTIFICATIONS === "true",
} as const;
