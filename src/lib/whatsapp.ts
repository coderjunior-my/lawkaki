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
  confirmCode:     string;
}): Promise<void> {
  const msg = [
    `Hi ${opts.posterFirstName} — ${opts.pickerName} wants to cover your job.`,
    `${opts.venue}`,
    `${opts.docType} · ${opts.time}, ${opts.date}`,
    ``,
    `Reply CONFIRM ${opts.confirmCode} to confirm them, or open Law Kaki.`,
  ].join("\n");

  await send(opts.posterPhone, msg);
}

// ─── Interest reminders ────────────────────────────────────────────────────
// Sent by the cron sweep at day 3 and day 7 while an interest is still
// pending. At day 9 the interest expires without a further message.

export async function notifyInterestReminder(opts: {
  posterPhone:     string;
  posterFirstName: string;
  pickerName:      string;
  venue:           string;
  docType:         string;
  date:            string;
  time:            string;
  confirmCode:     string;
  stage:           1 | 2;
}): Promise<void> {
  const nudge = opts.stage === 1
    ? `${opts.pickerName} is still waiting on your confirmation.`
    : `Last call — ${opts.pickerName}'s interest expires soon if you don't respond.`;

  const msg = [
    `Hi ${opts.posterFirstName} — ${nudge}`,
    `${opts.venue}`,
    `${opts.docType} · ${opts.time}, ${opts.date}`,
    ``,
    `Reply CONFIRM ${opts.confirmCode} to confirm them, or open Law Kaki.`,
  ].join("\n");

  await send(opts.posterPhone, msg);
}

// ─── New job broadcast ─────────────────────────────────────────────────────
// Sent to every eligible Picker when a Poster creates a job.

export async function notifyNewJob(opts: {
  pickerPhone: string;
  venue:       string;
  docType:     string;
  area?:       string;
  fee:         number;
  date:        string;
  time:        string;
}): Promise<void> {
  const headline = opts.area ? `New job in ${opts.area}.` : "New job posted.";
  const msg = [
    `${headline} RM${opts.fee}.`,
    `${opts.venue}`,
    `${opts.docType} · ${opts.time}, ${opts.date}`,
    ``,
    `Open Law Kaki to pick it up.`,
  ].join("\n");

  await send(opts.pickerPhone, msg);
}

// ─── Appointment reminders ─────────────────────────────────────────────────
// Sent to both parties on a confirmed job, 2 hours and 30 minutes before
// the appointment.

export async function notifyAppointmentReminder(opts: {
  pickerPhone:     string;
  pickerFirstName: string;
  posterPhone:     string;
  posterFirstName: string;
  venue:           string;
  docType:         string;
  time:            string;
  stage:           "2h" | "30m";
}): Promise<void> {
  const lead = opts.stage === "2h" ? "2 hrs to go." : "30 mins to go.";

  await send(
    opts.pickerPhone,
    [
      `${lead} Time to head to ${opts.venue}.`,
      `${opts.docType} · ${opts.time}`,
    ].join("\n"),
  );

  await send(
    opts.posterPhone,
    [
      `${lead} Your kaki is on the way.`,
      `${opts.pickerFirstName} is covering ${opts.venue}, ${opts.time}.`,
    ].join("\n"),
  );
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
