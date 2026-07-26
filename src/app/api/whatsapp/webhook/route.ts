import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { confirmPickerForInterest } from "@/lib/jobActions";

// Twilio inbound WhatsApp webhook — lets a poster reply "CONFIRM <code>"
// instead of opening the app. Configure this route's full URL as the
// WhatsApp sandbox/number's "when a message comes in" webhook in the
// Twilio console.

const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// https://www.twilio.com/docs/usage/security#validating-requests
function verifyTwilioSignature(url: string, params: Record<string, string>, signature: string | null): boolean {
  if (!AUTH_TOKEN) return true; // local dev, no Twilio credentials configured — same fallback as lib/whatsapp.ts
  if (!signature) return false;

  let data = url;
  for (const key of Object.keys(params).sort()) data += key + params[key];

  const expected = crypto.createHmac("sha1", AUTH_TOKEN).update(data, "utf-8").digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function twiml(message: string) {
  return new NextResponse(
    `<Response><Message>${escapeXml(message)}</Message></Response>`,
    { status: 200, headers: { "Content-Type": "text/xml" } },
  );
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = String(value); });

  const signature = req.headers.get("x-twilio-signature");
  if (!verifyTwilioSignature(req.url, params, signature)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const from = (params.From ?? "").replace("whatsapp:", "").replace(/\D/g, "");
  const body = (params.Body ?? "").trim();

  const match = body.match(/confirm\D*(\d{4,6})/i);
  if (!match) {
    return twiml("Reply CONFIRM followed by the code from your WhatsApp message to confirm a picker.");
  }
  const confirmCode = match[1];

  const { data: interest } = await supabase
    .from("job_interests")
    .select(`
      id, job_id, picker_id,
      job:jobs!job_interests_job_id_fkey (
        id, poster:users!jobs_poster_id_fkey (phone)
      )
    `)
    .eq("confirm_code", confirmCode)
    .single();

  if (!interest) {
    return twiml("That code doesn't match a pending job. Open Law Kaki to see your posted jobs.");
  }

  const job    = Array.isArray(interest.job) ? interest.job[0] : interest.job;
  const poster = job && (Array.isArray(job.poster) ? job.poster[0] : job.poster);
  const posterPhoneDigits = (poster?.phone ?? "").replace(/\D/g, "");

  if (!job || !posterPhoneDigits || posterPhoneDigits !== from) {
    return twiml("That code isn't linked to a job you posted.");
  }

  const result = await confirmPickerForInterest({ jobId: interest.job_id, pickerId: interest.picker_id });
  if (!result.ok) {
    return twiml(result.error);
  }

  return twiml("Done — confirmed. You'll both get each other's contact on WhatsApp.");
}
