// Law Kaki — shared TypeScript types (mirrors schema.sql)

export type UserRole = "poster" | "picker" | "both";
export type UserStatus = "pending" | "active" | "suspended";
export type JobState = "open" | "urgent" | "taken" | "completed" | "cancelled";
export type DocType =
  | "SPA signing"
  | "Loan documentation"
  | "Discharge of Charge"
  | "Transfer at Land Office"
  | "Stamping at LHDN"
  | "Other";

export interface User {
  id: string;
  phone: string;           // E.164: +601XXXXXXXXX
  name: string | null;
  email: string | null;
  role: UserRole;
  firmId: string | null;   // FK → law_firms.id
  verified: boolean;
  verifiedAt: Date | null;
  onboarded: boolean;
  onboardedAt: Date | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawFirm {
  id: string;
  name: string;
  slug: string;
  state: "Kuala Lumpur" | "Selangor";
  active: boolean;
  createdAt: Date;
}

export interface OtpToken {
  id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;          // FK → users.id
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Phase 1: admin pre-approves phone numbers before they can register.
// Phase 2: replace with Bar Council roll number + practising certificate check.
export interface AdminApproval {
  id: string;
  phone: string;
  firmId: string | null;
  approvedById: string | null;
  approvedAt: Date;
  notes: string | null;
}

export interface Job {
  id: string;
  state: JobState;
  docType: DocType;
  venue: string;
  address: string;
  area: string | null;
  appointmentAt: Date;
  feeIndicative: number;   // RM, indicative only — no platform money movement in Phase 1
  notes: string | null;
  posterId: string;        // FK → users.id
  pickerId: string | null; // FK → users.id
  pickedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  id: string;
  jobId: string;           // FK → jobs.id (unique: one rating per job)
  posterId: string;        // FK → users.id
  pickerId: string;        // FK → users.id
  punctuality: 1 | 2 | 3 | 4 | 5;
  professionalism: 1 | 2 | 3 | 4 | 5;
  completeness: 1 | 2 | 3 | 4 | 5;
  note: string | null;
  createdAt: Date;
}

// Derived view — computed from ratings table
export interface PickerRating {
  pickerId: string;
  totalJobs: number;
  avgRating: number;
  avgPunctuality: number;
  avgProfessionalism: number;
  avgCompleteness: number;
}
