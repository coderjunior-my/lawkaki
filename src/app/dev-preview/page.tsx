"use client";

import Dashboard from "@/components/Dashboard";

/* ============================================================
   Mock data — for local UI review only. Intercepts fetch for the
   job endpoints so Tasks (and Browse) render populated without
   touching the real Supabase project.
   ============================================================ */

const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());

const MOCK_POSTED = [
  {
    id: "posted-1",
    state: "open",
    docType: "SPA signing",
    venue: "Ara Damansara Residence",
    address: "Jalan PJU 1A/41B, Ara Damansara, 47301 Petaling Jaya",
    area: "Ara Damansara",
    time: "3:00 pm",
    date: "Today",
    dateMeta: "Today",
    appointmentAt: `${todayISO}T15:00:00+08:00`,
    fee: 200,
    distance: "—",
    duration: "—",
    poster: null,
    note: "Client running slightly late, flexible until 4pm.",
    x: 480, y: 360,
    expiredInterestCount: 1,
    interests: [
      {
        id: "int-1", jobId: "posted-1", expressedAt: "2 hours ago",
        picker: {
          name: "Priya Nair", phone: "+60123456781", initials: "PN",
          firm: "Nair & Co", firmState: "Selangor",
          totalJobs: 14, avgRating: 4.8, punctuality: 4.9, professionalism: 4.7, completeness: 4.8,
        },
      },
      {
        id: "int-2", jobId: "posted-1", expressedAt: "40 minutes ago",
        picker: {
          name: "Wei Jie Lim", phone: "+60123456782", initials: "WL",
          firm: "Lim & Tan Advocates", firmState: "Kuala Lumpur",
          totalJobs: 2, avgRating: null, punctuality: null, professionalism: null, completeness: null,
        },
      },
    ],
  },
  {
    id: "posted-2",
    state: "urgent",
    docType: "Loan documentation",
    venue: "Bangsar South Tower A",
    address: "Jalan Kerinchi, Bangsar South, 59200 Kuala Lumpur",
    area: "Bangsar South",
    time: "5:30 pm",
    date: "Today",
    dateMeta: "Today",
    appointmentAt: `${todayISO}T17:30:00+08:00`,
    fee: 300,
    distance: "—",
    duration: "—",
    poster: null,
    note: "",
    x: 520, y: 400,
    expiredInterestCount: 0,
    interests: [
      {
        id: "int-3", jobId: "posted-2", expressedAt: "10 minutes ago",
        picker: {
          name: "Rohan Krishnan", phone: "+60123456783", initials: "RK",
          firm: "Krishnan Chambers", firmState: "Kuala Lumpur",
          totalJobs: 23, avgRating: 4.6, punctuality: 4.5, professionalism: 4.7, completeness: 4.5,
        },
      },
    ],
  },
];

const MOCK_PICKED = [
  {
    id: "picked-1",
    venue: "KLCC Suites",
    address: "No. 8, Jalan Pinang, KLCC, 50450 Kuala Lumpur",
    docType: "Discharge of Charge",
    dateLabel: "Today", dateISO: todayISO, time: "2:30 pm",
    fee: 250, status: "confirmed", paymentStatus: null,
    poster: { name: "Ahmad Farid", initials: "AF", firm: "Farid & Partners", firmState: "Kuala Lumpur", phone: "+60129876541" },
    x: 500, y: 350,
  },
  {
    id: "picked-2",
    venue: "Mont Kiara Pines",
    address: "Jalan Kiara 3, Mont Kiara, 50480 Kuala Lumpur",
    docType: "Transfer at Land Office",
    dateLabel: "Tomorrow", dateISO: "2026-07-21", time: "10:00 am",
    fee: 220, status: "confirmed", paymentStatus: null,
    poster: { name: "Siti Rahimah", initials: "SR", firm: "Rahimah & Co", firmState: "Selangor", phone: "+60129876542" },
    x: 460, y: 300,
  },
];

const MOCK_REVIEWS_PENDING = [
  {
    id: "completed-1",
    venue: "Damansara Heights Bungalow",
    docType: "SPA signing",
    dateLabel: "3 days ago",
    fee: 200,
    role: "poster",
    counterparty: { name: "Nurul Ain", initials: "NA" },
  },
  {
    id: "completed-2",
    venue: "Cheras Business Centre",
    docType: "Stamping at LHDN",
    dateLabel: "Yesterday",
    fee: 150,
    role: "picker",
    counterparty: { name: "Izzat Yusoff", initials: "IY" },
  },
];

const MOCK_BROWSE = [
  ...MOCK_POSTED.map(({ interests: _interests, ...j }) => ({ ...j, poster: { name: "Ahmad Farid", firm: "Farid & Partners", initials: "AF", rating: 0, phone: "+60129876541" } })),
  {
    id: "browse-1",
    state: "taken",
    docType: "Stamping at LHDN",
    venue: "Subang Jaya SS15",
    address: "Jalan SS15/4, Subang Jaya, 47500 Selangor",
    area: "Subang Jaya",
    time: "11:00 am",
    date: "Tomorrow",
    dateMeta: "Tomorrow",
    fee: 180,
    distance: "—",
    duration: "—",
    poster: { name: "Nurul Ain", firm: "Ain Legal", initials: "NA", rating: 0, phone: "+60129876543" },
    note: "",
    takenBy: { name: "Izzat Yusoff", initials: "IY" },
    x: 440, y: 430,
  },
];

if (typeof window !== "undefined") {
  const w = window as unknown as { __lkMockInstalled?: boolean };
  if (!w.__lkMockInstalled) {
    w.__lkMockInstalled = true;
    const realFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const json = (body: unknown) =>
        new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

      if (url.startsWith("/api/jobs/posted")) return json({ jobs: MOCK_POSTED });
      if (url.startsWith("/api/jobs/picked")) return json({ jobs: MOCK_PICKED });
      if (url.startsWith("/api/reviews/pending")) return json({ reviews: MOCK_REVIEWS_PENDING });
      if (url.startsWith("/api/reviews") && init?.method === "POST") return json({ ok: true });
      if (url.startsWith("/api/jobs")) return json({ jobs: MOCK_BROWSE });
      return realFetch(input, init);
    };
  }
}

export default function DevPreview() {
  return (
    <Dashboard
      token="dev-preview-token"
      userId="dev-user"
      userName="Test Lawyer"
      userPhone="+60123456789"
    />
  );
}
