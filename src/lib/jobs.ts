// Frontend shape for a job in the browse / posted views.
// Populated by /api/jobs and /api/jobs/posted — not a DB schema.

export interface Poster {
  name:     string;
  firm:     string;
  initials: string;
  rating:   number;
  phone:    string;
}

export interface Job {
  id:       string;
  state:    "open" | "urgent" | "taken" | "completed" | "cancelled" | "expired";
  docType:  string;
  venue:    string;
  address:  string;
  area:     string;
  time:     string;
  date:     string;
  dateMeta: string;
  appointmentAt: string; // ISO — for sorting; use date/dateMeta/time for display
  fee:      number;
  distance: string;
  duration: string;
  poster:   Poster | null;
  note:     string;
  takenBy?: { name: string; initials: string };
  x:        number;
  y:        number;
  expiredInterestCount?: number;
}
