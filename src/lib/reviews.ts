// Types for the "Give review" tab — populated by /api/reviews/pending.

export type ReviewerRole = "poster" | "picker";

export interface PendingReview {
  id:         string; // job id
  venue:      string;
  docType:    string;
  dateLabel:  string;
  fee:        number;
  role:       ReviewerRole; // my role in this job
  counterparty: { name: string; initials: string };
}
