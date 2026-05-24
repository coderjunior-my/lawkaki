export interface Poster {
  name: string;
  firm: string;
  initials: string;
  rating: number;
  phone: string;  // WhatsApp-registered MY mobile, E.164
}

export interface Job {
  id: string;
  state: "open" | "taken" | "urgent";
  docType: string;
  venue: string;
  address: string;
  area: string;
  time: string;
  date: string;
  dateMeta: string;
  fee: number;
  distance: string;
  duration: string;
  poster: Poster;
  note: string;
  takenBy?: { name: string; initials: string };
  x: number; // position on 1000-wide map
  y: number; // position on 700-tall map
}

export const JOBS: Job[] = [
  {
    id: "lk-2026-0418",
    state: "urgent",
    docType: "Loan documentation",
    venue: "Public Bank · KLCC",
    address: "Menara Public Bank, Jln Ampang",
    area: "KLCC",
    time: "11:00 am",
    date: "Today",
    dateMeta: "Thu 23 May",
    fee: 220,
    distance: "3.1 km",
    duration: "45 min",
    poster: { name: "Adeline Lim", firm: "Lim & Partners", initials: "AL", rating: 4.9, phone: "+60123456781" },
    note: "Borrower will be there 15 mins early. Witness signature, return originals same day.",
    x: 562,
    y: 318,
  },
  {
    id: "lk-2026-0421",
    state: "open",
    docType: "SPA signing",
    venue: "Maybank · Mont Kiara",
    address: "Plaza Mont Kiara, Jln Kiara",
    area: "Mont Kiara",
    time: "3:00 pm",
    date: "Fri",
    dateMeta: "Fri 24 May",
    fee: 150,
    distance: "4.1 km",
    duration: "30 min",
    poster: { name: "Adrian Tan", firm: "Tan & Co.", initials: "AT", rating: 4.9, phone: "+60173456782" },
    note: "Standard SPA, single purchaser. ~30 mins on the ground.",
    x: 430,
    y: 232,
  },
  {
    id: "lk-2026-0414",
    state: "open",
    docType: "Discharge of Charge",
    venue: "CIMB · Bangsar South",
    address: "The Vertical, Jln Kerinchi",
    area: "Bangsar",
    time: "4:00 pm",
    date: "Tue",
    dateMeta: "Tue 28 May",
    fee: 120,
    distance: "6.4 km",
    duration: "25 min",
    poster: { name: "Priya S.", firm: "PS Law", initials: "PS", rating: 4.8, phone: "+60112345678" },
    note: "Discharge documents pre-signed, just need attestation.",
    x: 470,
    y: 460,
  },
  {
    id: "lk-2026-0409",
    state: "taken",
    docType: "Transfer at Land Office",
    venue: "Pejabat Tanah PJ",
    address: "Jln Yong Shook Lin, PJ",
    area: "Petaling Jaya",
    time: "9:30 am",
    date: "Mon",
    dateMeta: "Mon 27 May",
    fee: 280,
    distance: "8.2 km",
    duration: "60 min",
    poster: { name: "Haziq R.", firm: "Haziq Rahman & Co.", initials: "HR", rating: 5.0, phone: "+60163456784" },
    note: "Transfer instrument + presentation. Taken by Marcus.",
    takenBy: { name: "Marcus Tan", initials: "MT" },
    x: 250,
    y: 360,
  },
  {
    id: "lk-2026-0427",
    state: "open",
    docType: "Stamping at LHDN",
    venue: "LHDN Cheras",
    address: "Jln 3/108C, Cheras",
    area: "Cheras",
    time: "10:15 am",
    date: "Wed",
    dateMeta: "Wed 29 May",
    fee: 95,
    distance: "11.0 km",
    duration: "40 min",
    poster: { name: "Wei Ling", firm: "WL Conveyancing", initials: "WL", rating: 4.7, phone: "+60193456785" },
    note: "Drop & collect — no signing needed.",
    x: 700,
    y: 520,
  },
];
