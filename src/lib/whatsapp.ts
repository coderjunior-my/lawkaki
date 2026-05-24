// WhatsApp delivery via Twilio.
// Falls back to console.log when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are absent
// so local dev never needs real credentials.
//
// Production checklist:
//   1. Twilio sandbox → pilot (users opt-in by texting the sandbox keyword once)
//   2. Submit WhatsApp message templates for approval before going live
//   3. Upgrade from sandbox to a registered WhatsApp Business number

const SID   = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM  = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

function isConfigured(): boolean {
  return !!(SID && TOKEN);
}

async function send(to: string, body: string): Promise<void> {
  if (!isConfigured()) {
    // Dev fallback — print to server console so the team can verify copy
    console.log(`\n[WhatsApp → ${to}]\n${body}\n`);
    return;
  }

  const url  = `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`;
  const auth = Buffer.from(`${SID}:${TOKEN}`).toString("base64");

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      Authorization:  `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: FROM,
      To:   `whatsapp:${to}`,
      Body: body,
    }).toString(),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(`Twilio error: ${json.message ?? res.statusText}`);
  }
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string, code: string): Promise<void> {
  await send(
    phone,
    `Your Law Kaki code is ${code}. Valid for 5 minutes. Don't share this with anyone.`,
  );
}

// ─── Interest notification ────────────────────────────────────────────────────
// Sent to the Poster when a Picker clicks "I'm interested".

export async function notifyPosterOfInterest(opts: {
  posterPhone:     string;
  posterFirstName: string;
  pickerName:      string;
  venue:           string;
  docType:         string;
  date:            string;
  time:            string;
}): Promise<void> {
  const msg = [
    `Hi ${opts.posterFirstName} — ${opts.pickerName} wants to cover your job.`,
    `${opts.venue}`,
    `${opts.docType} · ${opts.time}, ${opts.date}`,
    ``,
    `Open Law Kaki to confirm them.`,
  ].join("\n");

  await send(opts.posterPhone, msg);
}

// ─── Confirmation notifications ───────────────────────────────────────────────
// Sent to both parties when the Poster confirms a Picker.

export async function notifyConfirmation(opts: {
  pickerPhone:     string;
  pickerFirstName: string;
  posterPhone:     string;
  posterFirstName: string;
  venue:           string;
  docType:         string;
  date:            string;
  time:            string;
}): Promise<void> {
  await send(
    opts.pickerPhone,
    [
      `Confirmed, kaki. ${opts.venue}`,
      `${opts.docType} · ${opts.time}, ${opts.date}`,
      ``,
      `${opts.posterFirstName} posted this job. Their number is in the app.`,
    ].join("\n"),
  );

  await send(
    opts.posterPhone,
    [
      `Done. ${opts.pickerFirstName} is covering your ${opts.venue} appointment.`,
      `${opts.docType} · ${opts.time}, ${opts.date}`,
      ``,
      `Their number is in the app. You're free, kaki.`,
    ].join("\n"),
  );
}
