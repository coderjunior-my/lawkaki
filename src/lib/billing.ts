// Platform billing — Poster → Law Kaki. Separate from the indicative
// commission a poster pays a picker directly (that stays outside the
// platform in Phase 1). See schema.sql for the fee_transactions /
// platform_payments tables this drives.

import { supabase } from "@/lib/supabase";

// Current listing/success fee per completed job. Zero today — this is the
// infrastructure for turning Phase 2 monetisation on, not the rollout of it.
export const PLATFORM_FEE_RM = 0;

// A transaction is due 7 days after creation...
export const DUE_DAYS = 7;
// ...or immediately, for every unpaid transaction, once the poster's total
// unpaid balance crosses this threshold. Computed at query time from the
// live balance, never stored, so it can't go stale.
export const BALANCE_THRESHOLD_RM = 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

// Law Kaki's own settlement account — Phase 1 has no payment gateway, so
// this is what a poster wires their platform fee to directly.
export const PLATFORM_BANK_DETAILS = {
  bankName:      "Maybank",
  accountName:   "Law Kaki Sdn Bhd",
  accountNumber: "5123 4567 8901",
  reference:     "Use your registered mobile number as the payment reference.",
};

// Called when a job is marked complete — one fee_transactions row per
// completed job, never duplicated (job_id is unique on the table).
export async function createFeeTransaction(jobId: string, posterId: string): Promise<void> {
  const dueAt = new Date(Date.now() + DUE_DAYS * DAY_MS).toISOString();
  const { error } = await supabase.from("fee_transactions").insert({
    job_id:    jobId,
    poster_id: posterId,
    amount:    PLATFORM_FEE_RM,
    due_at:    dueAt,
  });
  // 23505 = unique violation on job_id — completeJob() already ran for this
  // job once; nothing to do. Anything else is worth knowing about.
  if (error && (error as { code?: string }).code !== "23505") {
    console.error("[createFeeTransaction]", error);
  }
}
