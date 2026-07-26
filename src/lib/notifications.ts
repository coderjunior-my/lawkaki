// In-app notification records — written for every WhatsApp-worthy event
// regardless of whether the WhatsApp leg succeeds. This is the fallback
// called out in CLAUDE.md's known weak spots ("WhatsApp single point of
// failure"): if Twilio is down or the flag is off, the event still lands
// here instead of disappearing.

import { supabase } from "@/lib/supabase";
import type { NotificationType } from "@/lib/types";

export async function createNotification(opts: {
  userId:        string;
  jobId?:        string;
  type:          NotificationType;
  role:          "poster" | "picker";
  title:         string;
  body?:         string;
  whatsappSent:  boolean;
}): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id:          opts.userId,
    job_id:           opts.jobId ?? null,
    type:             opts.type,
    role:             opts.role,
    title:            opts.title,
    body:             opts.body ?? null,
    whatsapp_sent_at: opts.whatsappSent ? new Date().toISOString() : null,
  });
  if (error) console.error("[createNotification]", error);
}
