// Types for picker interest data — populated by /api/jobs/posted.

import type { MalaysianState } from "./types";

export interface PickerProfile {
  name:            string;
  phone:           string;
  initials:        string;
  firm:            string;
  firmState:       MalaysianState;
  totalJobs:       number;
  avgRating:       number | null;  // null when < 3 completed jobs
  punctuality:     number | null;
  professionalism: number | null;
  completeness:    number | null;
}

export interface Interest {
  id:          string;
  jobId:       string;
  picker:      PickerProfile;
  expressedAt: string;
}
