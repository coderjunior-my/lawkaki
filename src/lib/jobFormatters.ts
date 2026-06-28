// DB row → frontend shape transformers

import type { MalaysianState } from "./types";

const MYT = "Asia/Kuala_Lumpur";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function parseApptAt(iso: string) {
  const d = new Date(iso);
  const now = new Date();

  const fmtDate = (dt: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: MYT }).format(dt); // YYYY-MM-DD

  const dateISO  = fmtDate(d);
  const todayISO = fmtDate(now);
  const tomorrowISO = fmtDate(new Date(now.getTime() + 86_400_000));

  const time = new Intl.DateTimeFormat("en-MY", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: MYT,
  }).format(d).toLowerCase().replace(/\s/g, " ");

  const dateMeta = new Intl.DateTimeFormat("en-MY", {
    weekday: "short", day: "numeric", month: "short", timeZone: MYT,
  }).format(d);

  const dayShort = new Intl.DateTimeFormat("en-MY", {
    weekday: "short", timeZone: MYT,
  }).format(d);

  let date: string;
  if (dateISO === todayISO)    date = "Today";
  else if (dateISO === tomorrowISO) date = "Tomorrow";
  else date = dayShort;

  const dateLabel =
    dateISO === todayISO    ? "Today"
    : dateISO === tomorrowISO ? "Tomorrow"
    : dateISO < todayISO      ? new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric", timeZone: MYT }).format(d)
    : dateMeta;

  return { time, date, dateMeta, dateLabel, dateISO };
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// ─── Browse / poster view ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatBrowseJob(row: any) {
  const { time, date, dateMeta } = parseApptAt(row.appointment_at);
  const poster = row.poster;
  const picker = row.picker;
  return {
    id:       row.id,
    state:    row.state as "open" | "urgent" | "taken",
    docType:  row.doc_type,
    venue:    row.venue,
    address:  row.address,
    area:     row.area ?? "",
    time,
    date,
    dateMeta,
    fee:      row.fee_indicative,
    distance: row.distance_text ?? "—",
    duration: row.duration_text ?? "—",
    poster: poster ? {
      name:     poster.name,
      firm:     poster.firm_name ?? "",
      initials: initials(poster.name),
      rating:   0,
      phone:    poster.phone,
    } : null,
    note:     row.notes ?? "",
    takenBy: picker ? { name: picker.name, initials: initials(picker.name) } : undefined,
    x:        row.map_x ?? 500,
    y:        row.map_y ?? 350,
  };
}

// ─── Poster "my jobs" view ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatPostedJob(row: any, interests: any[]) {
  const { time, date, dateMeta } = parseApptAt(row.appointment_at);
  const picker = row.picker;
  return {
    id:       row.id,
    state:    row.state as "open" | "urgent" | "taken",
    docType:  row.doc_type,
    venue:    row.venue,
    address:  row.address,
    area:     row.area ?? "",
    time,
    date,
    dateMeta,
    fee:      row.fee_indicative,
    distance: row.distance_text ?? "—",
    duration: row.duration_text ?? "—",
    poster:   null,
    note:     row.notes ?? "",
    takenBy: picker ? { name: picker.name, initials: initials(picker.name) } : undefined,
    x:        row.map_x ?? 500,
    y:        row.map_y ?? 350,
    interests: interests.map((int) => {
      const p = int.picker;
      const rating = int.rating;  // from picker_ratings view, may be null
      const COLD_START = 3;
      const showRating = rating && Number(rating.total_jobs) >= COLD_START;
      return {
        id:          int.id,
        jobId:       row.id,
        expressedAt: relativeTime(int.expressed_at),
        picker: {
          name:            p?.name ?? "Unknown",
          phone:           p?.phone ?? "",
          initials:        initials(p?.name),
          firm:            p?.firm_name ?? "",
          firmState:       (p?.firm_state ?? "Kuala Lumpur") as MalaysianState,
          totalJobs:       showRating ? Number(rating.total_jobs) : 0,
          avgRating:       showRating ? Number(rating.avg_rating) : null,
          punctuality:     showRating ? Number(rating.avg_punctuality) : null,
          professionalism: showRating ? Number(rating.avg_professionalism) : null,
          completeness:    showRating ? Number(rating.avg_completeness) : null,
        },
      };
    }),
  };
}

// ─── Picker "my picked jobs" view ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatPickedJob(row: any, statusOverride?: "awaiting") {
  const { time, dateLabel, dateISO } = parseApptAt(row.appointment_at);
  const poster = row.poster;

  const status: "awaiting" | "confirmed" | "completed" =
    statusOverride ?? (row.state === "completed" ? "completed" : "confirmed");

  const paymentStatus =
    status === "completed"
      ? ((row.payment_status as "paid" | "unpaid") ?? "unpaid")
      : null;

  return {
    id:        row.id,
    venue:     row.venue,
    address:   row.address,
    docType:   row.doc_type,
    dateLabel,
    dateISO,
    time,
    fee:       row.fee_indicative,
    status,
    paymentStatus,
    poster: poster ? {
      name:      poster.name,
      initials:  initials(poster.name),
      firm:      poster.firm_name ?? "",
      firmState: (poster.firm_state ?? "Kuala Lumpur") as MalaysianState,
      phone:     poster.phone,
    } : null,
    x: row.map_x ?? 500,
    y: row.map_y ?? 350,
  };
}
