export type PickedJobStatus = "awaiting" | "confirmed" | "completed";
export type PaymentStatus   = "unpaid" | "paid";
export type StatusFilter    = "all" | "today" | "awaiting" | "confirmed" | "completed";
export type PayFilter       = "all" | "paid" | "unpaid";

// Anchored to mock data dates
export const TODAY = "2026-05-24";

export interface PickedJobPoster {
  name: string;
  initials: string;
  firm: string;
  firmState: "Kuala Lumpur" | "Selangor";
  phone: string; // E.164
}

export interface PickedJob {
  id: string;
  venue: string;
  address: string;
  docType: string;
  dateLabel: string;  // human-readable display label
  dateISO: string;    // YYYY-MM-DD for sorting
  time: string;       // "HH:MM AM/PM"
  fee: number;
  status: PickedJobStatus;
  paymentStatus: PaymentStatus | null; // null when not yet completed
  poster: PickedJobPoster;
  x: number; // SVG map coordinate (0–1000)
  y: number; // SVG map coordinate (0–700)
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

export function parseTimeToMins(time: string): number {
  const [timePart, period] = time.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  const h24 = period === "PM" && h !== 12 ? h + 12 : (period === "AM" && h === 12 ? 0 : h);
  return h24 * 60 + (m || 0);
}

export function minsToTimeStr(totalMins: number): string {
  const h  = Math.floor(totalMins / 60);
  const m  = totalMins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12    = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// ─── Poster profiles ──────────────────────────────────────────────────────────

const POSTERS: Record<string, PickedJobPoster> = {
  hafidz: { name: "Hafidz Osman",      initials: "HO", firm: "Osman & Partners",   firmState: "Kuala Lumpur", phone: "+60123500001" },
  nurul:  { name: "Nurul Ain Ibrahim",  initials: "NI", firm: "Ismail & Ain LLP",   firmState: "Kuala Lumpur", phone: "+60123500002" },
  ahmad:  { name: "Ahmad Farouk",       initials: "AF", firm: "Farouk & Co.",        firmState: "Kuala Lumpur", phone: "+60123500003" },
  lim:    { name: "Lim Chee Keong",     initials: "LK", firm: "Chee Keong & Co.",    firmState: "Selangor",     phone: "+60123500004" },
  priya:  { name: "Priya Menon",        initials: "PM", firm: "Menon & Associates",  firmState: "Selangor",     phone: "+60123500005" },
  rafiq:  { name: "Rafiq Zulkifli",     initials: "RZ", firm: "ZK Law",              firmState: "Kuala Lumpur", phone: "+60123500006" },
};

// ─── Picked jobs (mock — dates anchored to 2026-05-24) ────────────────────────

export const PICKED_JOBS: PickedJob[] = [
  // ── Today ──────────────────────────────────────────────────────────────────
  {
    id: "pk-006",
    venue: "Wisma Damansara",
    address: "Jalan Semantan, Damansara Heights, Kuala Lumpur",
    docType: "Discharge of Charge",
    dateLabel: "Today",
    dateISO: "2026-05-24",
    time: "11:00 AM",
    fee: 180,
    status: "confirmed",
    paymentStatus: null,
    poster: POSTERS.rafiq,
    x: 374, y: 328,
  },
  {
    id: "pk-001",
    venue: "Bangsar Village II",
    address: "Jalan Telawi 1, Bangsar, Kuala Lumpur",
    docType: "SPA Signing",
    dateLabel: "Today",
    dateISO: "2026-05-24",
    time: "3:00 PM",
    fee: 120,
    status: "confirmed",
    paymentStatus: null,
    poster: POSTERS.hafidz,
    x: 448, y: 450,
  },
  // ── Upcoming ───────────────────────────────────────────────────────────────
  {
    id: "pk-002",
    venue: "Mont Kiara Palma",
    address: "Jalan Kiara, Mont Kiara, Kuala Lumpur",
    docType: "Loan Docs",
    dateLabel: "Tomorrow",
    dateISO: "2026-05-25",
    time: "2:30 PM",
    fee: 150,
    status: "confirmed",
    paymentStatus: null,
    poster: POSTERS.nurul,
    x: 420, y: 218,
  },
  {
    id: "pk-003",
    venue: "Menara KLCC",
    address: "Jalan Ampang, KLCC, Kuala Lumpur",
    docType: "Memorandum of Transfer",
    dateLabel: "Thu 28 May",
    dateISO: "2026-05-28",
    time: "4:00 PM",
    fee: 220,
    status: "awaiting",
    paymentStatus: null,
    poster: POSTERS.ahmad,
    x: 558, y: 312,
  },
  // ── Completed ──────────────────────────────────────────────────────────────
  {
    id: "pk-004",
    venue: "Jaya One",
    address: "No. 72A, Jalan Universiti, Petaling Jaya",
    docType: "Discharge of Charge",
    dateLabel: "18 May 2026",
    dateISO: "2026-05-18",
    time: "11:00 AM",
    fee: 180,
    status: "completed",
    paymentStatus: "paid",
    poster: POSTERS.lim,
    x: 230, y: 363,
  },
  {
    id: "pk-005",
    venue: "Cheras Leisure Mall",
    address: "Jalan Manis 6, Taman Segar, Cheras, Kuala Lumpur",
    docType: "Stamping",
    dateLabel: "20 May 2026",
    dateISO: "2026-05-20",
    time: "10:00 AM",
    fee: 95,
    status: "completed",
    paymentStatus: "unpaid",
    poster: POSTERS.priya,
    x: 695, y: 512,
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function getTodayPickedJobs(): PickedJob[] {
  return PICKED_JOBS
    .filter((j) => j.dateISO === TODAY)
    .sort((a, b) => parseTimeToMins(a.time) - parseTimeToMins(b.time));
}
