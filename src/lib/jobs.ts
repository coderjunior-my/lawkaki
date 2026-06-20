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
  state:    "open" | "urgent" | "taken";
  docType:  string;
  venue:    string;
  address:  string;
  area:     string;
  time:     string;
  date:     string;
  dateMeta: string;
  fee:      number;
  distance: string;
  duration: string;
  poster:   Poster | null;
  note:     string;
  takenBy?: { name: string; initials: string };
  x:        number;
  y:        number;
}
