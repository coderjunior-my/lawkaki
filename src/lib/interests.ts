export interface PickerProfile {
  name: string;
  phone: string;
  initials: string;
  firm: string;
  firmState: "Kuala Lumpur" | "Selangor";
  totalJobs: number;
  // null when < 3 completed jobs (cold-start rule — score not shown yet)
  avgRating: number | null;
  punctuality: number | null;
  professionalism: number | null;
  completeness: number | null;
}

export interface Interest {
  id: string;
  jobId: string;
  picker: PickerProfile;
  expressedAt: string; // human-readable relative time
}

// ─── Picker profiles ──────────────────────────────────────────────────────────

const PICKERS: Record<string, PickerProfile> = {
  marcus: {
    name: "Marcus Tan",
    phone: "+60123400001",
    initials: "MT",
    firm: "Tan & Co.",
    firmState: "Kuala Lumpur",
    totalJobs: 12,
    avgRating: 4.8,
    punctuality: 4.9,
    professionalism: 4.8,
    completeness: 4.7,
  },
  raj: {
    name: "Raj Kumar",
    phone: "+60123400002",
    initials: "RK",
    firm: "Saravana & Associates",
    firmState: "Kuala Lumpur",
    totalJobs: 8,
    avgRating: 4.9,
    punctuality: 5.0,
    professionalism: 4.9,
    completeness: 4.8,
  },
  weilin: {
    name: "Wei Lin Chong",
    phone: "+60123400003",
    initials: "WL",
    firm: "WL Conveyancing",
    firmState: "Selangor",
    totalJobs: 5,
    avgRating: 4.6,
    punctuality: 4.6,
    professionalism: 4.5,
    completeness: 4.7,
  },
  siti: {
    name: "Siti Hajar",
    phone: "+60123400004",
    initials: "SH",
    firm: "Mansoor & Partners",
    firmState: "Kuala Lumpur",
    totalJobs: 2,
    avgRating: null,
    punctuality: null,
    professionalism: null,
    completeness: null,
  },
  azlan: {
    name: "Azlan Hamid",
    phone: "+60123400005",
    initials: "AH",
    firm: "Noor Azman & Co",
    firmState: "Kuala Lumpur",
    totalJobs: 15,
    avgRating: 4.7,
    punctuality: 4.8,
    professionalism: 4.7,
    completeness: 4.6,
  },
};

// ─── Interests per job ────────────────────────────────────────────────────────

export const INTERESTS: Interest[] = [
  // lk-2026-0418 — KLCC urgent (RM 220)
  { id: "int-001", jobId: "lk-2026-0418", picker: PICKERS.marcus, expressedAt: "2 hrs ago" },
  { id: "int-002", jobId: "lk-2026-0418", picker: PICKERS.raj,    expressedAt: "45 min ago" },

  // lk-2026-0421 — Mont Kiara open (RM 150)
  { id: "int-003", jobId: "lk-2026-0421", picker: PICKERS.weilin, expressedAt: "1 hr ago" },
  { id: "int-004", jobId: "lk-2026-0421", picker: PICKERS.siti,   expressedAt: "30 min ago" },

  // lk-2026-0414 — Bangsar open (RM 120)
  { id: "int-005", jobId: "lk-2026-0414", picker: PICKERS.azlan,  expressedAt: "3 hrs ago" },

  // lk-2026-0409 — PJ taken (RM 280) — no pending interests
  // lk-2026-0427 — Cheras open (RM 95)  — no interest yet
];
