// Types and helpers for the picker's "my jobs" view.
// Data populated by /api/jobs/picked.

import type { MalaysianState } from "./types";

export type PickedJobStatus = "awaiting" | "confirmed" | "completed";
export type PaymentStatus   = "unpaid" | "paid";
export type StatusFilter    = "all" | "today" | "awaiting" | "confirmed" | "completed";
export type PayFilter       = "all" | "paid" | "unpaid";

export interface PickedJobPoster {
  name:      string;
  initials:  string;
  firm:      string;
  firmState: MalaysianState;
  phone:     string;
}

export interface PickedJob {
  id:            string;
  venue:         string;
  address:       string;
  docType:       string;
  dateLabel:     string;
  dateISO:       string;
  time:          string;
  fee:           number;
  status:        PickedJobStatus;
  paymentStatus: PaymentStatus | null;
  poster:        PickedJobPoster | null;
  x:             number;
  y:             number;
}

// ─── Time helpers (used by TodayItinerary travel estimates) ──────────────────

export function parseTimeToMins(time: string): number {
  const [timePart, period] = time.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  const h24 =
    period?.toUpperCase() === "PM" && h !== 12 ? h + 12
    : period?.toUpperCase() === "AM" && h === 12 ? 0
    : h;
  return h24 * 60 + (m || 0);
}

export function minsToTimeStr(totalMins: number): string {
  const h      = Math.floor(totalMins / 60);
  const m      = totalMins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12    = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// Real today in MYT — used for "Today" filter and route map
export function getTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}
