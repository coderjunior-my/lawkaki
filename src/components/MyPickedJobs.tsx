"use client";

import { useState, useEffect, CSSProperties } from "react";
import {
  PickedJob,
  PickedJobStatus,
  StatusFilter,
  PayFilter,
  getTodayISO,
  parseTimeToMins,
  minsToTimeStr,
} from "@/lib/pickedJobs";

/* ============================================================
   Icon
   ============================================================ */
interface IconProps { d: string | string[]; size?: number; sw?: number; style?: CSSProperties }
function Icon({ d, size = 16, sw = 2, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={style}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const I = {
  chevD:  "m6 9 6 6 6-6",
  chevU:  "m18 15-6-6-6 6",
  clock:  ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 7v5l3 2"],
  loc:    ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  msg:    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  check:  "M20 6 9 17l-5-5",
  car:    "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5M14 17h1m4 0h1M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
};

/* ============================================================
   Helpers
   ============================================================ */
function statusBadge(status: PickedJobStatus) {
  if (status === "awaiting")  return { label: "Awaiting",  bg: "#F3F3F1", fg: "#4A4A48", border: "#D5D2C9", dot: "#8A8A8A" };
  if (status === "confirmed") return { label: "Confirmed", bg: "#0F1F33", fg: "#F5F5F3", border: "#0F1F33", dot: "#F5F5F3" };
  return                             { label: "Completed", bg: "#E8E8E6", fg: "#0F1F33", border: "#D5D2C9", dot: "#0F1F33" };
}

// ~0.15 min per SVG unit, rounded to nearest 5, minimum 5
function estimateTravelMins(from: PickedJob, to: PickedJob): number {
  const d = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
  return Math.max(5, Math.round(d * 0.15 / 5) * 5);
}

function filterAndSort(jobs: PickedJob[], sf: StatusFilter, pf: PayFilter): PickedJob[] {
  const todayISO = getTodayISO();
  let result = [...jobs];
  if      (sf === "today")     result = result.filter((j) => j.dateISO === todayISO);
  else if (sf === "awaiting")  result = result.filter((j) => j.status === "awaiting");
  else if (sf === "confirmed") result = result.filter((j) => j.status === "confirmed");
  else if (sf === "completed") result = result.filter((j) => j.status === "completed");
  if (sf === "completed" && pf !== "all") result = result.filter((j) => j.paymentStatus === pf);

  if (sf === "completed") {
    result.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  } else if (sf === "all") {
    const upcoming = result.filter((j) => j.status !== "completed").sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const done     = result.filter((j) => j.status === "completed").sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    return [...upcoming, ...done];
  } else {
    result.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || parseTimeToMins(a.time) - parseTimeToMins(b.time));
  }
  return result;
}

function emptyMessage(sf: StatusFilter, pf: PayFilter): string {
  if (sf === "today")     return "Nothing on today. Enjoy the break, kaki.";
  if (sf === "awaiting")  return "No jobs awaiting confirmation.";
  if (sf === "confirmed") return "No confirmed jobs right now.";
  if (sf === "completed") {
    if (pf === "paid")   return "No paid jobs yet.";
    if (pf === "unpaid") return "All settled. No outstanding payments.";
    return "No completed jobs yet.";
  }
  return "No picked jobs yet. Head to Browse to find one.";
}

/* ============================================================
   Shared poster + WhatsApp section (used in both views)
   ============================================================ */
function PosterDetail({ job }: { job: PickedJob }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Contextual note */}
      {job.status === "awaiting" && (
        <div style={{ background: "var(--off-white)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--warm-grey)", fontWeight: 500 }}>
          Waiting for the poster to confirm. You&apos;ll get a WhatsApp message when they do.
        </div>
      )}
      {job.status === "completed" && job.paymentStatus === "unpaid" && (
        <div style={{ background: "#FFFFFF", borderRadius: 8, borderLeft: "3px solid #B91C1C", padding: "8px 12px", fontSize: 12, color: "#B91C1C", fontWeight: 500 }}>
          Commission not yet received. Follow up with the poster.
        </div>
      )}
      {job.status === "completed" && job.paymentStatus === "paid" && (
        <div style={{ background: "var(--off-white)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--warm-grey)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d={I.check} size={13} sw={2.5} />
          Commission received. Nicely done, kaki.
        </div>
      )}

      {/* Poster info */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--warm-grey)", marginBottom: 8 }}>
          Posted by
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="lk-avatar" style={{ width: 38, height: 38, fontSize: 13, background: "var(--black)", color: "var(--off-white)", flexShrink: 0 }}>
            {job.poster?.initials ?? "?"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>{job.poster?.name ?? "—"}</div>
            <div style={{ fontSize: 11, color: "var(--warm-grey)", marginTop: 2 }}>{job.poster?.firm} · {job.poster?.firmState}</div>
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <button
        onClick={() => job.poster && window.open(`https://wa.me/${job.poster.phone.replace("+", "")}`, "_blank")}
        style={{ width: "100%", height: 40, background: "var(--black)", color: "var(--off-white)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "-0.01em" }}
      >
        <Icon d={I.msg} size={15} />
        Contact via WhatsApp
      </button>
    </div>
  );
}

/* ============================================================
   Today itinerary view — timeline with travel estimates
   ============================================================ */
function TodayItinerary({
  jobs,
  expandedId,
  onToggle,
}: {
  jobs: PickedJob[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const totalFee = jobs.reduce((s, j) => s + j.fee, 0);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 12px 24px" }}>
        {/* Summary header */}
        <div style={{ marginBottom: 18, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {jobs.length} appointment{jobs.length !== 1 ? "s" : ""} today
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            RM {totalFee}
          </div>
        </div>

        {jobs.map((job, idx) => {
          const nextJob   = idx < jobs.length - 1 ? jobs[idx + 1] : null;
          const travelMin = nextJob ? estimateTravelMins(job, nextJob) : null;
          const departBy  = travelMin !== null && nextJob
            ? minsToTimeStr(parseTimeToMins(nextJob.time) - travelMin)
            : null;
          const badge     = statusBadge(job.status);
          const isExp     = expandedId === job.id;

          return (
            <div key={job.id}>
              {/* Stop row */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {/* Number badge */}
                <div style={{ width: 28, height: 28, borderRadius: 999, background: "#0F1F33", color: "#F5F5F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                  {idx + 1}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  {/* Clickable header */}
                  <button
                    onClick={() => onToggle(job.id)}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", color: "inherit", padding: 0 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-grey)", marginBottom: 2, fontVariantNumeric: "tabular-nums" }}>
                          {job.time}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                          {job.venue}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--warm-grey)", marginTop: 3 }}>
                          {job.docType}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 11, color: "var(--warm-grey)" }}>
                          <Icon d={I.loc} size={10} />
                          <span>{job.address}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.fg, border: `1px solid ${badge.border}` }}>
                          <span style={{ width: 4, height: 4, borderRadius: 999, background: badge.dot }} />
                          {badge.label}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>RM {job.fee}</span>
                        <span style={{ color: "var(--warm-grey)", display: "flex" }}>
                          <Icon d={isExp ? I.chevU : I.chevD} size={13} />
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded poster detail */}
                  {isExp && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--pale-grey)" }}>
                      <PosterDetail job={job} />
                    </div>
                  )}
                </div>
              </div>

              {/* Connector to next stop */}
              {nextJob && (
                <div style={{ display: "flex", gap: 12, margin: "6px 0" }}>
                  {/* Vertical line aligned to number column */}
                  <div style={{ width: 28, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 2, minHeight: 44, background: "var(--pale-grey)", borderRadius: 1 }} />
                  </div>
                  {/* Travel time info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <Icon d={I.car} size={13} style={{ color: "var(--warm-grey)", flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-grey)" }}>
                        ~{travelMin} min drive
                      </span>
                      {departBy && (
                        <span style={{ fontSize: 11, color: "var(--warm-grey)", marginLeft: 6 }}>
                          · Depart by {departBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Standard card view (all filters except today)
   ============================================================ */
function PickedJobCard({
  job,
  expanded,
  onToggle,
}: {
  job: PickedJob;
  expanded: boolean;
  onToggle: () => void;
}) {
  const badge = statusBadge(job.status);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${expanded ? "var(--black)" : "var(--hair)"}`,
        borderLeft: `3px solid ${badge.dot}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: expanded ? "0 4px 12px -4px rgba(15,31,51,0.16)" : "0 1px 0 0 rgba(15,31,51,0.04)",
        transition: "border-color 140ms, box-shadow 140ms",
      }}
    >
      <button
        onClick={onToggle}
        style={{ width: "100%", padding: "11px 13px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", color: "inherit", textAlign: "left", display: "flex", flexDirection: "column", gap: 6 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.02em", background: badge.bg, color: badge.fg, border: `1px solid ${badge.border}` }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: badge.dot }} />
            {badge.label}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--warm-grey)", fontWeight: 600 }}>{job.dateLabel}</span>
            <span style={{ color: "var(--warm-grey)", display: "flex" }}>
              <Icon d={expanded ? I.chevU : I.chevD} size={14} />
            </span>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{job.venue}</div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 11, color: "var(--warm-grey)" }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><Icon d={I.loc} size={11} /></span>
          <span>{job.docType} · {job.address}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: "1px solid var(--pale-grey)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
            <Icon d={I.clock} size={12} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{job.time}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {job.status === "completed" && job.paymentStatus && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: job.paymentStatus === "paid" ? "var(--warm-grey)" : "#B91C1C" }}>
                {job.paymentStatus === "paid" ? "Paid" : "Unpaid"}
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>RM {job.fee}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--pale-grey)", padding: "12px 13px 14px" }}>
          <PosterDetail job={job} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Chip styles
   ============================================================ */
function sfChipStyle(active: boolean): CSSProperties {
  return { padding: "6px 12px", borderRadius: 999, border: `1px solid ${active ? "var(--black)" : "var(--hair)"}`, background: active ? "var(--black)" : "#FFFFFF", color: active ? "var(--off-white)" : "var(--black)", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", letterSpacing: "-0.005em", flexShrink: 0 };
}
function pfChipStyle(active: boolean): CSSProperties {
  return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${active ? "var(--black)" : "var(--hair)"}`, background: active ? "var(--pale-grey)" : "#FFFFFF", color: "var(--black)", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", letterSpacing: "-0.005em", flexShrink: 0 };
}

/* ============================================================
   MyPickedJobs — main export
   ============================================================ */
const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "today",     label: "Today"     },
  { id: "all",       label: "All"       },
  { id: "awaiting",  label: "Awaiting"  },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
];
const PAY_FILTERS: { id: PayFilter; label: string }[] = [
  { id: "all",    label: "All payments" },
  { id: "paid",   label: "Paid"         },
  { id: "unpaid", label: "Unpaid"       },
];

export default function MyPickedJobs({
  token = "",
  onFilterChange,
  onJobsLoaded,
}: {
  token?:         string;
  onFilterChange?: (filter: StatusFilter) => void;
  onJobsLoaded?:  (jobs: PickedJob[]) => void;
}) {
  const [allPickedJobs, setAllPickedJobs] = useState<PickedJob[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("today");
  const [payFilter,    setPayFilter]    = useState<PayFilter>("all");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs/picked", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        const loaded = d.jobs ?? [];
        setAllPickedJobs(loaded);
        onJobsLoaded?.(loaded);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStatusFilter(id: StatusFilter) {
    setStatusFilter(id);
    if (id !== "completed") setPayFilter("all");
    setExpandedId(null);
    onFilterChange?.(id);
  }

  const jobs = filterAndSort(allPickedJobs, statusFilter, payFilter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Filter bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid var(--hair)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {STATUS_FILTERS.map((f) => (
            <button key={f.id} onClick={() => handleStatusFilter(f.id)} style={sfChipStyle(statusFilter === f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        {statusFilter === "completed" && (
          <div style={{ display: "flex", gap: 6 }}>
            {PAY_FILTERS.map((f) => (
              <button key={f.id} onClick={() => setPayFilter(f.id)} style={pfChipStyle(payFilter === f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "var(--warm-grey)", fontSize: 13, padding: 40 }}>
            Loading…
          </div>
        </div>
      ) : statusFilter === "today" ? (
        jobs.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "var(--warm-grey)", fontSize: 13, padding: 40 }}>
              Nothing on today. Enjoy the break, kaki.
            </div>
          </div>
        ) : (
          <TodayItinerary
            jobs={jobs}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          />
        )
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {jobs.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--warm-grey)", fontSize: 13 }}>
                {emptyMessage(statusFilter, payFilter)}
              </div>
            ) : (
              jobs.map((j) => (
                <PickedJobCard
                  key={j.id}
                  job={j}
                  expanded={expandedId === j.id}
                  onToggle={() => setExpandedId(expandedId === j.id ? null : j.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
