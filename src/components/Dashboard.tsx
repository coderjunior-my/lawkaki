"use client";

import { useState, useMemo, useEffect, useCallback, CSSProperties } from "react";
import { Job } from "@/lib/jobs";
import { DocType } from "@/lib/types";
import MyJobs from "@/components/MyJobs";
import MyPickedJobs from "@/components/MyPickedJobs";
import ReminderPopup from "@/components/ReminderPopup";
import { PickedJob, StatusFilter, getTodayISO, parseTimeToMins } from "@/lib/pickedJobs";
import TaskTracker from "@/components/TaskTracker";
import Settings from "@/components/Settings";
import CoachmarkTour from "@/components/CoachmarkTour";
import CriticalNotice from "@/components/CriticalNotice";
import { getNotificationTarget, NotificationTarget, TaskTab } from "@/lib/notificationActions";

/* ============================================================
   Icon — inline Lucide-style SVGs
   ============================================================ */
interface IconProps {
  d: string | string[];
  size?: number;
  sw?: number;
  style?: CSSProperties;
  className?: string;
  "aria-hidden"?: boolean;
}

function Icon({ d, size = 20, sw = 2, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const I = {
  bell:   "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  search: [
    "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
    "M21 21l-4.35-4.35",
  ],
  clock:  [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
    "M12 7v5l3 2",
  ],
  plus:   "M12 5v14M5 12h14",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  cal:    "M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  doc:    [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8",
  ],
  rm:     "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  chevL:  "m15 18-6-6 6-6",
  chevR:  "m9 18 6-6-6-6",
  close:  "M18 6 6 18M6 6l12 12",
  locate: [
    "M12 2v4",
    "M12 18v4",
    "M2 12h4",
    "M18 12h4",
    "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  ],
  gear: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  ],
  tasks: [
    "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2",
    "M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V3z",
    "m9 14 2 2 4-4",
  ],
};

/* ============================================================
   Logo mark
   ============================================================ */
function LogoMark({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <a href="/" style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, textDecoration: "none", flexShrink: 0 }}>
      <svg width="32" height="40" viewBox="0 0 80 100" fill="none" aria-hidden>
        <path
          d="M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z"
          fill="#0F1F33"
        />
      </svg>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--black)" }}>Law Kaki</div>
        {!isMobile && (
          <div style={{ fontSize: 11, color: "var(--warm-grey)", fontWeight: 500 }}>Your best legal kaki on the ground.</div>
        )}
      </div>
    </a>
  );
}

/* ============================================================
   Notifications — bell dropdown, split by role
   ============================================================ */
interface NotificationItem {
  id: string;
  jobId: string | null;
  type: string;
  role: "poster" | "picker";
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function NotificationBell({
  token = "",
  onNavigate,
}: {
  token?: string;
  onNavigate?: (target: NotificationTarget) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userRole, setUserRole]           = useState<"poster" | "picker" | "both">("both");
  const [open, setOpen]                   = useState(false);
  // null until the user explicitly picks a tab — defaults to their role once fetched.
  const [manualTab, setManualTab]         = useState<"poster" | "picker" | null>(null);
  const tab = manualTab ?? (userRole === "poster" ? "poster" : "picker");

  const refresh = useCallback(() => {
    if (!token) return;
    fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setUserRole(d.role ?? "both");
        setNotifications(d.notifications ?? []);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const visible     = userRole === "both" ? notifications.filter((n) => n.role === tab) : notifications;
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const visibleUnreadIds = visible.filter((n) => !n.readAt).map((n) => n.id);

  async function markRead(ids: string[]) {
    if (!ids.length) return;
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: n.readAt ?? now } : n)));
    if (!token) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(ids.length === 1 ? { id: ids[0] } : { ids }),
      });
    } catch {
      // Best-effort — local state already reflects read, will reconcile on next refresh
    }
  }

  return (
    <div id="lk-coach-bell" style={{ position: "relative" }}>
      <button
        onClick={() => { const next = !open; setOpen(next); if (next) refresh(); }}
        style={iconBtnStyle}
        aria-label="Notifications"
      >
        <Icon d={I.bell} size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute", top: 8, right: 8, width: 8, height: 8,
              background: "var(--amber)", borderRadius: 999, border: "2px solid #FFFFFF",
            }}
          />
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 250 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 251,
              width: 360, maxWidth: "calc(100vw - 24px)", maxHeight: 460,
              background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 16,
              boxShadow: "0 24px 48px -12px rgba(15,31,51,0.28)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--hair)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>Notifications</div>
              {visibleUnreadIds.length > 0 && (
                <button
                  onClick={() => markRead(visibleUnreadIds)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--black)", fontFamily: "inherit", fontSize: 12, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3, padding: 0 }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {userRole === "both" && (
              <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderBottom: "1px solid var(--hair)" }}>
                {(["picker", "poster"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setManualTab(r)}
                    style={{
                      padding: "6px 12px", borderRadius: 999, whiteSpace: "nowrap",
                      border: `1px solid ${tab === r ? "var(--black)" : "var(--hair)"}`,
                      background: tab === r ? "var(--black)" : "#FFFFFF",
                      color: tab === r ? "var(--off-white)" : "var(--black)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {r === "picker" ? "As picker" : "As poster"}
                  </button>
                ))}
              </div>
            )}

            <div className="lk-scroll" style={{ overflowY: "auto", flex: 1 }}>
              {visible.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--warm-grey)", fontSize: 13 }}>
                  No notifications yet.
                </div>
              ) : (
                visible.map((n) => {
                  const unread = !n.readAt;
                  const target = getNotificationTarget(n.type, n.role);
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead([n.id]);
                        if (target && onNavigate) {
                          onNavigate(target);
                          setOpen(false);
                        }
                      }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "12px 16px", background: unread ? "var(--off-white)" : "#FFFFFF",
                        border: "none", borderBottom: "1px solid var(--pale-grey)",
                        cursor: target ? "pointer" : "default", fontFamily: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span
                          style={{
                            width: 6, height: 6, borderRadius: 999, marginTop: 6, flexShrink: 0,
                            background: unread ? "var(--amber)" : "transparent",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: unread ? 700 : 500, color: "var(--black)" }}>{n.title}</div>
                          {n.body && (
                            <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                          )}
                          <div style={{ fontSize: 11, color: "var(--warm-grey)", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   TopNav
   ============================================================ */

function TopNav({
  isMobile = false,
  onSettings,
  onTasks,
  tasksActive = false,
  token = "",
  onNotificationNavigate,
}: {
  isMobile?: boolean;
  onSettings?: () => void;
  onTasks?: () => void;
  tasksActive?: boolean;
  token?: string;
  onNotificationNavigate?: (target: NotificationTarget) => void;
}) {
  return (
    <header
      style={{
        height: 64,
        background: "#FFFFFF",
        borderBottom: "1px solid var(--hair)",
        display: "flex",
        alignItems: "center",
        padding: isMobile ? "0 12px" : "0 24px",
        gap: isMobile ? 10 : 24,
        flexShrink: 0,
      }}
    >
      <LogoMark isMobile={isMobile} />

      <div style={{ flex: 1 }} />

      {/* Tasks — jump straight to the task tracker */}
      <button
        id="lk-coach-tasks"
        onClick={onTasks}
        style={tasksActive ? iconBtnActiveStyle : iconBtnStyle}
        aria-label="Tasks"
        aria-current={tasksActive ? "page" : undefined}
        title="Tasks"
      >
        <Icon d={I.tasks} size={19} />
      </button>

      {/* Bell */}
      <NotificationBell token={token} onNavigate={onNotificationNavigate} />

      {/* Settings */}
      <button id="lk-coach-settings" onClick={onSettings} style={iconBtnStyle} aria-label="Settings">
        <Icon d={I.gear} size={18} />
      </button>
    </header>
  );
}

const iconBtnStyle: CSSProperties = {
  position: "relative",
  width: 40,
  height: 40,
  border: "1px solid transparent",
  background: "transparent",
  borderRadius: 999,
  cursor: "pointer",
  color: "var(--black)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const iconBtnActiveStyle: CSSProperties = {
  ...iconBtnStyle,
  background: "var(--black)",
  color: "var(--off-white)",
};

/* ============================================================
   FilterBar
   ============================================================ */
interface Filters {
  date: string;
  docType: string;
  minFee: number;
}

const DATE_OPTS = ["Today", "Tomorrow", "This week", "All upcoming"];
const DOC_TYPES = ["All", "SPA signing", "Loan docs", "Discharge", "Transfer", "Stamping"];

// Days between a job's appointment and today, in MYT — used by the date chip.
// Returns NaN (rather than throwing) if appointmentAt is missing or malformed.
function daysFromTodayMYT(appointmentAt: string): number {
  const d = new Date(appointmentAt);
  if (Number.isNaN(d.getTime())) return NaN;
  const isoDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(d);
  const jobDate = Date.parse(isoDate);
  const today = Date.parse(getTodayISO());
  return Math.round((jobDate - today) / 86_400_000);
}

function matchesDateFilter(appointmentAt: string, dateFilter: string): boolean {
  if (dateFilter === "All upcoming") return true;
  const days = daysFromTodayMYT(appointmentAt);
  if (Number.isNaN(days)) return true; // malformed appointment time — don't hide the job over it
  if (dateFilter === "Today") return days === 0;
  if (dateFilter === "Tomorrow") return days === 1;
  if (dateFilter === "This week") return days >= 0 && days <= 6;
  return true;
}

function matchesSearch(job: Job, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [job.venue, job.address, job.area, job.docType, job.poster?.name ?? ""]
    .some((field) => field.toLowerCase().includes(q));
}

function FilterBar({
  filters,
  setFilters,
  count,
  search,
  onSearchChange,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  count: number;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div
      id="lk-coach-filters"
      style={{
        padding: "14px 18px",
        background: "#FFFFFF",
        borderBottom: "1px solid var(--hair)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--warm-grey)",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          <Icon d={I.search} size={15} />
        </span>
        <input
          className="lk-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by venue, area, or document type"
          style={{ height: 40, paddingLeft: 38, paddingRight: search ? 36 : 16 }}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 22,
              height: 22,
              border: "none",
              background: "transparent",
              color: "var(--warm-grey)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d={I.close} size={14} />
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Available jobs
          </span>
          <span style={{ fontSize: 12, color: "var(--warm-grey)", fontWeight: 500 }}>
            · {count} near you
          </span>
        </div>
        <button className="lk-btn lk-btn--ghost lk-btn--sm" style={{ height: 28, padding: "0 8px" }}>
          <Icon d={I.filter} size={14} /> More
        </button>
      </div>

      {/* Date */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={filterLabelRow}>
          <span style={filterLabelStyle}>
            <Icon d={I.cal} size={11} sw={2.2} />
            Date
          </span>
          <button
            style={filterResetStyle}
            onClick={() => setFilters({ ...filters, date: "This week" })}
          >
            Reset
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {DATE_OPTS.map((d) => (
            <button
              key={d}
              onClick={() => setFilters({ ...filters, date: d })}
              style={chipStyle(filters.date === d, "date")}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Doc type */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={filterLabelRow}>
          <span style={filterLabelStyle}>
            <Icon d={I.doc} size={11} sw={2.2} />
            Document type
          </span>
          <button
            style={filterResetStyle}
            onClick={() => setFilters({ ...filters, docType: "All" })}
          >
            Reset
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {DOC_TYPES.map((d) => (
            <button
              key={d}
              onClick={() => setFilters({ ...filters, docType: d })}
              style={chipStyle(filters.docType === d, "doc")}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Fee floor */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={filterLabelRow}>
          <span style={filterLabelStyle}>
            <Icon d={I.rm} size={11} sw={2.2} />
            Fee floor
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            ≥ RM {filters.minFee}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="500"
          step="10"
          value={filters.minFee}
          onChange={(e) => setFilters({ ...filters, minFee: Number(e.target.value) })}
          style={{ width: "100%", accentColor: "var(--black)" } as CSSProperties}
        />
      </div>
    </div>
  );
}

const filterLabelRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const filterLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 10.5,
  color: "var(--warm-grey)",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};
const filterResetStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: 11,
  color: "var(--warm-grey)",
  fontWeight: 600,
  fontFamily: "inherit",
  letterSpacing: "0.02em",
};

function chipStyle(active: boolean, kind: "date" | "doc"): CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: kind === "doc" ? 8 : 999,
    border: `1px solid ${active ? "var(--black)" : "var(--hair)"}`,
    background: active
      ? kind === "doc"
        ? "var(--pale-grey)"
        : "var(--black)"
      : "#FFFFFF",
    color: active
      ? kind === "doc"
        ? "var(--black)"
        : "var(--off-white)"
      : "var(--black)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    letterSpacing: "-0.005em",
  };
}

/* ============================================================
   Job state helpers
   ============================================================ */
function jobStateInfo(state: Job["state"]) {
  if (state === "urgent")
    return { label: "Urgent", accent: "#E89020", bg: "#F9DDB4", fg: "#7A4A0F", border: "#E89020" };
  if (state === "taken")
    return { label: "Taken", accent: "#6B7280", bg: "#EDEAE2", fg: "#0F1F33", border: "#E0DDD3" };
  return { label: "Open", accent: "#0F1F33", bg: "#FFFFFF", fg: "#0F1F33", border: "#E0DDD3" };
}

/* ============================================================
   Job card
   ============================================================ */
function JobCard({
  job,
  selected,
  onSelect,
  onHover,
  onAccept,
}: {
  job: Job;
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onAccept: (job: Job) => void;
}) {
  const info = jobStateInfo(job.state);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(job.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(job.id);
        }
      }}
      onMouseEnter={() => onHover(job.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        background: "#FFFFFF",
        border: `1px solid ${selected ? "var(--black)" : "var(--hair)"}`,
        borderLeft: `3px solid ${selected ? "var(--black)" : info.accent}`,
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "border-color 140ms var(--ease), box-shadow 140ms var(--ease)",
        boxShadow: selected
          ? "0 4px 12px -4px rgba(15,31,51,0.16)"
          : "0 1px 0 0 rgba(15,31,51,0.04)",
        width: "100%",
      }}
    >
      {/* Row 1: state badge + distance */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.02em",
            background: info.bg,
            color: info.fg,
            border: `1px solid ${info.border}`,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 999, background: info.accent }} />
          {info.label}
        </span>
        <span style={{ fontSize: 10, color: "var(--warm-grey)", fontWeight: 500 }}>
          {job.distance} · {job.duration}
        </span>
      </div>

      {/* Row 2: venue + address */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 2,
          }}
        >
          {job.venue}
        </div>
        <div style={{ fontSize: 11, color: "var(--warm-grey)" }}>
          {job.docType} · {job.address}
        </div>
      </div>

      {/* Row 3: time + fee */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 6,
          borderTop: "1px solid var(--pale-grey)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <Icon d={I.clock} size={12} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {job.time} · {job.date}
          </span>
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.01em",
          }}
        >
          RM {job.fee}
        </div>
      </div>

      {/* Row 4: taken-by or CTA */}
      {job.state === "taken" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--warm-grey)",
            fontWeight: 500,
          }}
        >
          <div
            className="lk-avatar lk-avatar--sm"
            style={{ width: 20, height: 20, fontSize: 10 }}
          >
            {job.takenBy!.initials}
          </div>
          Taken by {job.takenBy!.name}
        </div>
      ) : (
        <button
          className={job.state === "urgent" ? "lk-btn lk-btn--accent" : "lk-btn"}
          onClick={(e) => {
            e.stopPropagation();
            onAccept(job);
          }}
          style={{ width: "100%", height: 32, fontSize: 12 }}
        >
          I&apos;m interested
        </button>
      )}
    </div>
  );
}

/* ============================================================
   Map pin
   ============================================================ */
function MapPin({
  job,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  job: Job;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const isUrgent = job.state === "urgent";
  const isTaken = job.state === "taken";
  const fill = isTaken ? "#0F1F33" : "#E89020";
  const isActive = selected || hovered;
  const pinW = isActive ? 36 : 32;
  const pinH = isActive ? 45 : 40;

  return (
    <button
      onClick={() => onSelect(job.id)}
      onMouseEnter={() => onHover(job.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "absolute",
        left: `${(job.x / 1000) * 100}%`,
        top: `${(job.y / 700) * 100}%`,
        transform: `translate(-50%, -100%) scale(${isActive ? 1.12 : 1})`,
        transformOrigin: "bottom center",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        zIndex: selected ? 30 : isActive ? 20 : isUrgent ? 15 : 10,
        transition: "transform 140ms var(--ease)",
        filter: isActive
          ? "drop-shadow(0 6px 12px rgba(15,31,51,0.25))"
          : "drop-shadow(0 2px 4px rgba(15,31,51,0.15))",
      }}
      aria-label={`${job.venue} · RM ${job.fee}`}
    >
      {/* Urgent pulse ring */}
      {isUrgent && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: -2,
            transform: "translateX(-50%)",
            width: 38,
            height: 38,
            borderRadius: 999,
            background: "rgba(232,144,32,0.25)",
            animation: "lk-pulse 1.6s cubic-bezier(0.2,0.6,0.2,1) infinite",
          }}
        />
      )}
      {/* Pin shape */}
      <svg width={pinW} height={pinH} viewBox="0 0 80 100" fill="none">
        <path
          d="M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z"
          fill={fill}
        />
        <circle cx="40" cy="40" r="14" fill={isTaken ? "#FAF7F2" : "#0F1F33"} />
        {isUrgent ? (
          <g>
            <rect x="38" y="30" width="4" height="12" rx="1.5" fill="#FAF7F2" />
            <rect x="38" y="45" width="4" height="4" rx="1.5" fill="#FAF7F2" />
          </g>
        ) : (
          <text
            x="40"
            y="46"
            fill={isTaken ? "#0F1F33" : "#FAF7F2"}
            fontSize="14"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="700"
            textAnchor="middle"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {job.fee >= 1000 ? `${Math.round(job.fee / 100) / 10}k` : job.fee}
          </text>
        )}
      </svg>
    </button>
  );
}

/* ============================================================
   Pin callout
   ============================================================ */
function PinCallout({
  job,
  onClose,
  onAccept,
}: {
  job: Job | undefined;
  onClose: () => void;
  onAccept: (job: Job) => void;
}) {
  if (!job) return null;
  const info = jobStateInfo(job.state);

  return (
    <div
      style={{
        position: "absolute",
        left: `${(job.x / 1000) * 100}%`,
        top: `${(job.y / 700) * 100}%`,
        transform: "translate(-50%, calc(-100% - 52px))",
        zIndex: 40,
        minWidth: 260,
        maxWidth: 300,
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid var(--hair)",
          boxShadow: "0 16px 40px -8px rgba(15,31,51,0.22)",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            width: 24,
            height: 24,
            cursor: "pointer",
            color: "var(--warm-grey)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
          aria-label="Close"
        >
          <Icon d={I.close} size={14} />
        </button>

        {/* Badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            alignSelf: "flex-start",
            background: info.bg,
            color: info.fg,
            border: `1px solid ${info.border}`,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 999, background: info.accent }} />
          {info.label}
        </span>

        {/* Venue */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{job.venue}</div>
          <div style={{ fontSize: 12, color: "var(--warm-grey)" }}>{job.docType}</div>
        </div>

        {/* Time + fee */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            paddingTop: 6,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {job.time} · {job.date}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            RM {job.fee}
          </div>
        </div>

        {job.state !== "taken" && (
          <button
            className={job.state === "urgent" ? "lk-btn lk-btn--accent" : "lk-btn"}
            onClick={() => onAccept(job)}
            style={{ width: "100%", height: 36, marginTop: 4 }}
          >
            I&apos;m interested
          </button>
        )}
      </div>

      {/* Tail */}
      <svg
        viewBox="0 0 18 10"
        style={{
          position: "absolute",
          left: "50%",
          bottom: -9,
          transform: "translateX(-50%)",
          width: 18,
          height: 10,
        }}
      >
        <path d="M0 0 L9 10 L18 0 Z" fill="#FFFFFF" stroke="var(--hair)" strokeWidth="1" />
        <path d="M1 0 L9 9 L17 0" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/* ============================================================
   Map base (stylised KL/Selangor SVG)
   ============================================================ */
function MapBase() {
  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block", background: "#ECE9E1" }}
    >
      {/* Land tints */}
      <rect x="0" y="0" width="1000" height="700" fill="#ECE9E1" />
      <path d="M0 0 L420 0 L390 120 L260 220 L120 260 L0 280 Z" fill="#E5E2DA" />
      <path d="M620 0 L1000 0 L1000 340 L840 360 L700 280 L580 180 L640 80 Z" fill="#E8E5DD" />
      <path d="M0 480 L160 460 L320 520 L260 700 L0 700 Z" fill="#E8E5DD" />
      <path d="M700 540 L900 520 L1000 600 L1000 700 L640 700 Z" fill="#E5E2DA" />

      {/* Klang River */}
      <path
        d="M460 0 C480 120,540 200,520 300 C500 400,560 480,540 560 C520 640,460 680,440 700"
        fill="none" stroke="#D5D9DD" strokeWidth="22" strokeLinecap="round"
      />
      <path
        d="M460 0 C480 120,540 200,520 300 C500 400,560 480,540 560 C520 640,460 680,440 700"
        fill="none" stroke="#DCDFE3" strokeWidth="16" strokeLinecap="round" opacity="0.6"
      />

      {/* Parks / forests */}
      <ellipse cx="180" cy="180" rx="80" ry="60" fill="#DDE2D8" opacity="0.6" />
      <ellipse cx="820" cy="400" rx="100" ry="70" fill="#DDE2D8" opacity="0.6" />
      <ellipse cx="320" cy="600" rx="60" ry="40" fill="#DDE2D8" opacity="0.6" />

      {/* Major highways */}
      <path d="M50 200 C200 100,400 80,600 100 S900 220,950 380"
        fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
      <path d="M50 200 C200 100,400 80,600 100 S900 220,950 380"
        fill="none" stroke="#D5D2C9" strokeWidth="11" strokeLinecap="round" opacity="0.4" />
      <path d="M80 540 C240 600,450 620,660 600 S920 540,980 480"
        fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
      <path d="M80 540 C240 600,450 620,660 600 S920 540,980 480"
        fill="none" stroke="#D5D2C9" strokeWidth="11" strokeLinecap="round" opacity="0.4" />

      {/* Federal Highway */}
      <path d="M0 460 L1000 220" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
      <path d="M0 460 L1000 220" stroke="#D5D2C9" strokeWidth="9" strokeLinecap="round" opacity="0.4" />

      {/* Jln Ampang */}
      <path d="M380 320 Q480 300,600 318 T820 290"
        fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

      {/* Jln Tun Razak loop */}
      <path d="M540 200 Q660 280,620 380 Q540 420,480 380 Q420 300,540 200 Z"
        fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

      {/* KL downtown grid */}
      <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
        <line x1="500" y1="340" x2="640" y2="340" />
        <line x1="500" y1="360" x2="640" y2="360" />
        <line x1="500" y1="380" x2="640" y2="380" />
        <line x1="520" y1="320" x2="520" y2="400" />
        <line x1="560" y1="320" x2="560" y2="400" />
        <line x1="600" y1="320" x2="600" y2="400" />
      </g>

      {/* Mont Kiara grid */}
      <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
        <line x1="380" y1="200" x2="470" y2="200" />
        <line x1="380" y1="220" x2="470" y2="220" />
        <line x1="380" y1="240" x2="470" y2="240" />
        <line x1="400" y1="185" x2="400" y2="260" />
        <line x1="430" y1="185" x2="430" y2="260" />
      </g>

      {/* PJ grid */}
      <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
        <line x1="180" y1="340" x2="300" y2="340" />
        <line x1="180" y1="360" x2="300" y2="360" />
        <line x1="180" y1="380" x2="300" y2="380" />
        <line x1="200" y1="320" x2="200" y2="400" />
        <line x1="240" y1="320" x2="240" y2="400" />
        <line x1="280" y1="320" x2="280" y2="400" />
      </g>

      {/* Bangsar grid */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
        <line x1="430" y1="445" x2="510" y2="445" />
        <line x1="430" y1="465" x2="510" y2="465" />
        <line x1="450" y1="430" x2="450" y2="480" />
        <line x1="480" y1="430" x2="480" y2="480" />
      </g>

      {/* Cheras grid */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
        <line x1="660" y1="510" x2="740" y2="510" />
        <line x1="660" y1="530" x2="740" y2="530" />
        <line x1="680" y1="495" x2="680" y2="545" />
        <line x1="720" y1="495" x2="720" y2="545" />
      </g>

      {/* Area labels */}
      <g
        fontFamily="Plus Jakarta Sans, Inter, sans-serif"
        fontSize="11"
        fontWeight="600"
        fill="#8A8579"
        letterSpacing="0.06em"
      >
        <text x="425" y="175" textAnchor="middle">MONT KIARA</text>
        <text x="560" y="305" textAnchor="middle">KLCC</text>
        <text x="240" y="320" textAnchor="middle">PETALING JAYA</text>
        <text x="470" y="430" textAnchor="middle">BANGSAR</text>
        <text x="700" y="495" textAnchor="middle">CHERAS</text>
        <text x="120" y="600" textAnchor="middle" fontSize="10">SUBANG</text>
        <text x="820" y="180" textAnchor="middle" fontSize="10">SETIAWANGSA</text>
        <text x="180" y="520" textAnchor="middle" fontSize="10">SHAH ALAM</text>
      </g>

      {/* Compass */}
      <g transform="translate(40 40)">
        <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#D6D3CA" strokeWidth="1" />
        <path d="M0 -10 L4 6 L0 2 L-4 6 Z" fill="#0F1F33" />
        <text
          x="0"
          y="-22"
          fontFamily="Plus Jakarta Sans"
          fontSize="9"
          fontWeight="700"
          fill="#0F1F33"
          textAnchor="middle"
        >
          N
        </text>
      </g>

      {/* Scale bar */}
      <g transform="translate(40 660)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="#0F1F33" strokeWidth="2" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#0F1F33" strokeWidth="2" />
        <line x1="80" y1="-4" x2="80" y2="4" stroke="#0F1F33" strokeWidth="2" />
        <text
          x="0"
          y="-8"
          fontFamily="Plus Jakarta Sans"
          fontSize="10"
          fontWeight="600"
          fill="#0F1F33"
        >
          2 km
        </text>
      </g>
    </svg>
  );
}

/* ============================================================
   Map controls
   ============================================================ */
const mapCtrlGroupStyle: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid var(--hair)",
  borderRadius: 10,
  boxShadow: "0 4px 12px -4px rgba(15,31,51,0.08)",
  overflow: "hidden",
};
const mapCtrlBtnStyle: CSSProperties = {
  width: 36,
  height: 36,
  background: "#FFFFFF",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--black)",
};

/* ============================================================
   Map area
   ============================================================ */
function MapArea({
  jobs,
  selectedId,
  hoveredId,
  setSelected,
  setHovered,
  onAccept,
  onPost,
  style,
}: {
  jobs: Job[];
  selectedId: string | null;
  hoveredId: string | null;
  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  onAccept: (job: Job) => void;
  onPost: () => void;
  style?: CSSProperties;
}) {
  const selectedJob = jobs.find((j) => j.id === selectedId);

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "#ECE9E1", ...style }}>
      <MapBase />

      {/* Pins */}
      {jobs.map((j) => (
        <MapPin
          key={j.id}
          job={j}
          selected={selectedId === j.id}
          hovered={hoveredId === j.id}
          onSelect={setSelected}
          onHover={setHovered}
        />
      ))}

      {/* Callout */}
      <PinCallout
        job={selectedJob}
        onClose={() => setSelected(null)}
        onAccept={onAccept}
      />

      {/* Map controls — top right */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 5,
        }}
      >
        <div style={mapCtrlGroupStyle}>
          <button style={mapCtrlBtnStyle} aria-label="Zoom in">
            <Icon d="M12 5v14M5 12h14" size={16} sw={2.4} />
          </button>
          <div style={{ height: 1, background: "var(--hair)" }} />
          <button style={mapCtrlBtnStyle} aria-label="Zoom out">
            <Icon d="M5 12h14" size={16} sw={2.4} />
          </button>
        </div>
        <button
          style={{ ...mapCtrlBtnStyle, ...mapCtrlGroupStyle, padding: 0, width: 36, height: 36 }}
          aria-label="Locate me"
        >
          <Icon d={I.locate} size={16} />
        </button>
      </div>

      {/* Legend — top left */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "#FFFFFF",
          border: "1px solid var(--hair)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          gap: 16,
          alignItems: "center",
          boxShadow: "0 4px 12px -4px rgba(15,31,51,0.08)",
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--warm-grey)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Pins
        </span>
        <LegendItem color="#E89020" label="Open" />
        <LegendItem color="#E89020" label="Urgent" pulse />
        <LegendItem color="#0F1F33" label="Taken" />
      </div>

      {/* Post a job FAB */}
      <button
        id="lk-coach-post"
        onClick={onPost}
        className="lk-btn lk-btn--accent"
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 6,
          boxShadow: "0 12px 28px -6px rgba(232,144,32,0.42)",
          height: 52,
          padding: "0 22px",
          fontSize: 14,
        }}
      >
        <Icon d={I.plus} size={18} sw={2.5} />
        Post a job
      </button>
    </div>
  );
}

function LegendItem({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
          display: "inline-block",
          boxShadow: pulse ? `0 0 0 3px rgba(232,144,32,0.25)` : "none",
        }}
      />
      {label}
    </span>
  );
}

/* ============================================================
   Toast
   ============================================================ */
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--black)",
        color: "var(--off-white)",
        padding: "12px 18px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        zIndex: 100,
        boxShadow: "0 12px 32px -8px rgba(15,31,51,0.4)",
        maxWidth: 480,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: 999, background: "var(--amber)", flexShrink: 0 }}
      />
      {message}
    </div>
  );
}

/* ============================================================
   Post a job sheet
   ============================================================ */
const NEW_JOB_DOC_TYPES: DocType[] = [
  "SPA signing",
  "Loan documentation",
  "Discharge of Charge",
  "Transfer at Land Office",
  "Stamping at LHDN",
  "Other",
];

function fieldStyle(): CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    height: 40, padding: "0 12px",
    border: "1px solid var(--hair)", borderRadius: 8,
    fontSize: 13, color: "var(--black)", fontFamily: "inherit",
    background: "#FFFFFF", outline: "none",
  };
}

function PostJobSheet({
  token,
  onClose,
  onPosted,
  isMobile = false,
}: {
  token: string;
  onClose: () => void;
  onPosted: () => void;
  isMobile?: boolean;
}) {
  const [docType, setDocType]   = useState<DocType>("SPA signing");
  const [venue, setVenue]       = useState("");
  const [address, setAddress]   = useState("");
  const [area, setArea]         = useState("");
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [fee, setFee]           = useState("");
  const [notes, setNotes]       = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const valid = venue.trim() && address.trim() && date && time && fee !== "" && Number(fee) >= 0;

  async function handleSubmit() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const appointmentAt = `${date}T${time}:00+08:00`; // MYT, no DST
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          docType, venue: venue.trim(), address: address.trim(),
          area: area.trim() || undefined,
          appointmentAt, feeIndicative: Number(fee),
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to post job.");
        setBusy(false);
        return;
      }
      onPosted();
    } catch {
      setError("Failed to post job. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,31,51,0.4)",
        zIndex: 200, display: "flex",
        alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
        padding: isMobile ? 0 : 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          width: "100%", maxWidth: isMobile ? "100%" : 440,
          maxHeight: isMobile ? "92dvh" : "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 48px -12px rgba(15,31,51,0.28)",
        }}
      >
        <div style={{ padding: isMobile ? "18px 20px 14px" : "24px 24px 20px", borderBottom: "1px solid var(--hair)", position: "relative", flexShrink: 0 }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: isMobile ? 14 : 16, right: isMobile ? 14 : 16, background: "transparent", border: "none", cursor: "pointer", color: "var(--warm-grey)", display: "flex", padding: 4 }}
          >
            <Icon d={I.close} size={18} />
          </button>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
              cursor: "pointer", color: "var(--warm-grey)", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              padding: "0 0 12px", marginLeft: -2,
            }}
          >
            <Icon d={I.chevL} size={16} /> Back
          </button>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--black)" }}>
            Post a job
          </div>
          <div style={{ fontSize: 13, color: "var(--warm-grey)", marginTop: 4 }}>
            Eligible pickers nearby will be notified.
          </div>
        </div>

        <div style={{ padding: isMobile ? "16px 20px" : "20px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", flex: 1, minHeight: 0 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
            Document type
            <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)} style={fieldStyle()}>
              {NEW_JOB_DOC_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
            Venue
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Ara Damansara Condo" style={fieldStyle()} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
            Address
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" style={fieldStyle()} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
            Area (optional)
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Petaling Jaya" style={fieldStyle()} />
          </label>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10 }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle()} />
            </label>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
              Time
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={fieldStyle()} />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
            Indicative commission (RM)
            <input type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} placeholder="150" style={fieldStyle()} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--warm-grey)" }}>
            Notes (optional)
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Anything the picker should know"
              style={{ ...fieldStyle(), height: "auto", padding: "10px 12px", resize: "none", lineHeight: 1.5 }}
            />
          </label>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 600, margin: 0 }}>{error}</p>
          )}
        </div>

        <div
          style={{
            padding: isMobile ? "12px 20px" : "4px 24px 24px",
            paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : undefined,
            borderTop: "1px solid var(--hair)",
            flexShrink: 0,
          }}
        >
          <button
            className="lk-btn lk-btn--accent lk-btn--lg"
            disabled={!valid || busy}
            onClick={handleSubmit}
            style={{ width: "100%" }}
          >
            {busy ? "Posting…" : "Post job"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Responsive helper
   ============================================================ */
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < bp);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [bp]);
  return mobile;
}

/* ============================================================
   Today route map — shown in Picked › Today view
   ============================================================ */
function TodayRouteMap({ jobs, style }: { jobs: PickedJob[]; style?: CSSProperties }) {
  if (jobs.length === 0) return null;
  const totalFee = jobs.reduce((s, j) => s + j.fee, 0);

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "#ECE9E1", ...style }}>
      <MapBase />

      {/* Dashed route overlay */}
      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {jobs.length > 1 && (
          <polyline
            points={jobs.map((j) => `${j.x},${j.y}`).join(" ")}
            fill="none"
            stroke="#E89020"
            strokeWidth="3"
            strokeDasharray="10 7"
            strokeLinecap="round"
            opacity="0.9"
          />
        )}
      </svg>

      {/* Numbered pins */}
      {jobs.map((j, idx) => (
        <div
          key={j.id}
          style={{
            position: "absolute",
            left: `${(j.x / 1000) * 100}%`,
            top: `${(j.y / 700) * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "#E89020",
              border: "2.5px solid #FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(15,31,51,0.24)",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: "#0F1F33" }}>{idx + 1}</span>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "#FFFFFF",
          border: "1px solid var(--hair)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 4px 12px -4px rgba(15,31,51,0.08)",
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-grey)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Today
        </span>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--warm-grey)", display: "inline-block" }} />
        <span style={{ fontSize: 12, fontWeight: 600 }}>{jobs.length} stop{jobs.length !== 1 ? "s" : ""}</span>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--warm-grey)", display: "inline-block" }} />
        <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>RM {totalFee}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Dashboard — main export
   ============================================================ */
export default function Dashboard({
  onSignOut,
  token     = "",
  userId    = "",
  userName  = "",
  userPhone = "",
}: {
  onSignOut?: () => void;
  token?:     string;
  userId?:    string;
  userName?:  string;
  userPhone?: string;
}) {
  const [filters, setFilters] = useState<Filters>({
    date: "This week",
    docType: "All",
    minFee: 50,
  });
  const [search, setSearch]           = useState("");
  const [view, setView]               = useState<"browse" | "my-jobs" | "picked" | "tasks">("browse");
  // Set when a notification click-through wants Task list to open on a
  // specific tab (e.g. "interest_received" → confirm tab).
  const [taskInitialTab, setTaskInitialTab] = useState<TaskTab | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [displayName, setDisplayName]   = useState(userName);
  const [pickedFilter, setPickedFilter] = useState<StatusFilter>("today");
  const [allJobs, setAllJobs]           = useState<Job[]>([]);
  const [pickedJobs, setPickedJobs]     = useState<PickedJob[]>([]);
  // undefined = not loaded yet, null = loaded but nothing saved — kept
  // distinct so the critical notice never flashes on screen before we
  // actually know either way.
  const [bankDetails, setBankDetails] = useState<
    { bankName: string; accountNumber: string; accountHolderName: string } | null | undefined
  >(undefined);
  const [billingDueNow, setBillingDueNow] = useState(0);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"profile" | "history" | "billing">("profile");
  const [settingsFocusPayment, setSettingsFocusPayment] = useState(false);

  const refreshBrowseJobs = useCallback(() => {
    return fetch("/api/jobs", token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then((r) => r.json())
      .then((d) => setAllJobs(d.jobs ?? []))
      .catch(() => {});
  }, [token]);

  // Fetch browse + picked jobs once on mount
  useEffect(() => {
    refreshBrowseJobs();

    if (token) {
      fetch("/api/jobs/picked", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setPickedJobs(d.jobs ?? []))
        .catch(() => {});

      fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setBankDetails(d.bankDetails ?? null))
        .catch(() => {});

      fetch("/api/billing/transactions", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          const dueNow = (d.transactions ?? [])
            .filter((t: { isDueNow: boolean; status: string }) => t.status === "unpaid" && t.isDueNow)
            .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
          setBillingDueNow(dueNow);
        })
        .catch(() => {});
    }
  }, [token, refreshBrowseJobs]);

  const showTodayMap = view === "picked" && pickedFilter === "today";
  const todayISO     = getTodayISO();
  const todayPickedJobs = showTodayMap
    ? pickedJobs
        .filter((j) => j.dateISO === todayISO && j.status !== "awaiting")
        .sort((a, b) => parseTimeToMins(a.time) - parseTimeToMins(b.time))
    : [];

  const [selectedId, setSelected] = useState<string | null>(null);
  const [hoveredId, setHovered] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [showPostSheet, setShowPostSheet] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!sessionStorage.getItem("lk_reminder_seen")) {
      setShowReminder(true);
    }
  }, []);

  function dismissReminder() {
    sessionStorage.setItem("lk_reminder_seen", "1");
    setShowReminder(false);
  }

  const filtered = useMemo(
    () =>
      allJobs.filter((j) => {
        if (
          filters.docType !== "All" &&
          !j.docType.toLowerCase().includes(filters.docType.toLowerCase().split(" ")[0])
        )
          return false;
        if (j.fee < filters.minFee) return false;
        if (!matchesDateFilter(j.appointmentAt, filters.date)) return false;
        if (!matchesSearch(j, search)) return false;
        return true;
      }),
    [allJobs, filters, search]
  );

  const onAccept = async (j: Job) => {
    setToast(`Interest sent. ${j.poster?.name.split(" ")[0] ?? "Poster"} will confirm via WhatsApp.`);
    try {
      await fetch("/api/jobs/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: j.id, pickerName: userName, pickerPhone: userPhone }),
      });
    } catch {
      // Notification best-effort — toast already shown optimistically
    }
  };
  const onPost = () => setShowPostSheet(true);

  function handleNotificationNavigate(target: NotificationTarget) {
    setView(target.view);
    if (target.taskTab) setTaskInitialTab(target.taskTab);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--off-white)",
      }}
    >
      {!showSettings && (
        <TopNav
          isMobile={isMobile}
          onSettings={() => setShowSettings(true)}
          onTasks={() => setView("tasks")}
          tasksActive={view === "tasks"}
          token={token}
          onNotificationNavigate={handleNotificationNavigate}
        />
      )}

      {/* Hidden while settings is open — Settings renders its own copy of
          these right under its own header, so the order (header, then
          notice) stays consistent instead of flipping when TopNav hides. */}
      {!showSettings && bankDetails === null && (
        <CriticalNotice
          message="Add your bank details so you can get paid for jobs you pick up."
          actionLabel="Add bank details"
          onAction={() => { setSettingsInitialTab("profile"); setSettingsFocusPayment(true); setShowSettings(true); }}
        />
      )}

      {!showSettings && billingDueNow > 0 && (
        <CriticalNotice
          message={`You have RM ${billingDueNow.toFixed(2)} in platform fees due now.`}
          actionLabel="Pay now"
          onAction={() => { setSettingsInitialTab("billing"); setShowSettings(true); }}
        />
      )}

      <main style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: isMobile ? "column" : "row" }}>
        {/* Left panel */}
        <aside
          style={{
            width: isMobile ? "100%"
              : showSettings || view === "tasks" ? "100%"
              : view === "picked" ? (showTodayMap ? 380 : "100%")
              : (panelOpen ? 380 : 0),
            flexShrink: 0,
            background: "var(--off-white)",
            borderRight: (isMobile || showSettings || view === "tasks" || (view === "picked" && !showTodayMap)) ? "none" : "1px solid var(--hair)",
            borderTop: isMobile ? "1px solid var(--hair)" : "none",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: isMobile ? "none" : "width 220ms var(--ease)",
            order: isMobile ? 1 : 0,
            flex: isMobile ? "1 1 auto" : undefined,
            minHeight: isMobile ? 0 : undefined,
          }}
        >
          {(isMobile || panelOpen || showSettings || view === "tasks") && (
            <>
              {showSettings ? (
                <Settings
                  token={token}
                  userName={displayName}
                  userPhone={userPhone}
                  onSignOut={onSignOut}
                  onClose={() => { setShowSettings(false); setSettingsFocusPayment(false); }}
                  onNameChange={(n) => {
                    setDisplayName(n);
                    localStorage.setItem("lk_name", n);
                  }}
                  bankDetails={bankDetails}
                  onBankDetailsSaved={(d) => setBankDetails(d)}
                  initialTab={settingsInitialTab}
                  focusPayment={settingsFocusPayment}
                  billingDueNow={billingDueNow}
                />
              ) : (
                <>
                  {/* Tab bar — hidden in Tasks, which has its own back arrow instead */}
                  {view !== "tasks" && (
                    <div
                      style={{
                        display: "flex",
                        background: "#FFFFFF",
                        borderBottom: "1px solid var(--hair)",
                        flexShrink: 0,
                      }}
                    >
                      {(
                        [
                          { id: "browse",  label: "Browse"  },
                          { id: "my-jobs", label: "Posted"  },
                          { id: "picked",  label: "Picked"  },
                        ] as { id: typeof view; label: string }[]
                      ).map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setView(id)}
                          style={{
                            flex: 1,
                            height: 44,
                            background: "transparent",
                            border: "none",
                            borderBottom: `2px solid ${view === id ? "var(--black)" : "transparent"}`,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 12,
                            fontWeight: view === id ? 700 : 500,
                            color: view === id ? "var(--black)" : "var(--warm-grey)",
                            letterSpacing: "-0.01em",
                            transition: "color 140ms, border-color 140ms",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {view === "tasks" ? (
                    <TaskTracker
                      token={token}
                      pickedJobs={pickedJobs}
                      onNavigate={(v) => setView(v)}
                      initialTab={taskInitialTab}
                    />
                  ) : view === "my-jobs" ? (
                    <MyJobs
                      token={token}
                      onConfirmed={(name) =>
                        setToast(`Confirmed. ${name.split(" ")[0]} will cover this job.`)
                      }
                    />
                  ) : view === "picked" ? (
                    <MyPickedJobs
                      token={token}
                      onFilterChange={setPickedFilter}
                      onJobsLoaded={setPickedJobs}
                    />
                  ) : (
                    <>
                      <FilterBar
                        filters={filters}
                        setFilters={setFilters}
                        count={filtered.length}
                        search={search}
                        onSearchChange={setSearch}
                      />
                      <div
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          padding: 10,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {filtered.map((j) => (
                          <JobCard
                            key={j.id}
                            job={j}
                            selected={selectedId === j.id}
                            onSelect={setSelected}
                            onHover={setHovered}
                            onAccept={onAccept}
                          />
                        ))}
                        {filtered.length === 0 && (
                          <div
                            style={{
                              padding: 32,
                              textAlign: "center",
                              color: "var(--warm-grey)",
                              fontSize: 13,
                            }}
                          >
                            {search ? "Nothing matches that." : "No jobs match these filters."}
                            <br />
                            Try a different area, doc type, or date.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </aside>

        {/* Collapse handle — desktop only */}
        {!isMobile && !showSettings && view !== "picked" && view !== "tasks" && (
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            aria-label={panelOpen ? "Collapse panel" : "Expand panel"}
            style={{
              width: 20,
              background: "var(--off-white)",
              border: "none",
              borderRight: "1px solid var(--hair)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--warm-grey)",
              flexShrink: 0,
            }}
          >
            <Icon d={panelOpen ? I.chevL : I.chevR} size={16} />
          </button>
        )}

        {/* Map area — hidden when settings or tasks; route map for picked+today; browse map otherwise */}
        {!showSettings && view !== "tasks" && (
          showTodayMap ? (
            <TodayRouteMap
              jobs={todayPickedJobs}
              style={isMobile ? { order: 0, flex: "0 0 42vh" } : undefined}
            />
          ) : view !== "picked" ? (
            <MapArea
              jobs={filtered}
              selectedId={selectedId}
              hoveredId={hoveredId}
              setSelected={setSelected}
              setHovered={setHovered}
              onAccept={onAccept}
              onPost={onPost}
              style={isMobile ? { order: 0, flex: "0 0 50vh" } : undefined}
            />
          ) : null
        )}
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      <CoachmarkTour active={view === "browse" && !showSettings && !showPostSheet} />

      {showPostSheet && (
        <PostJobSheet
          token={token}
          isMobile={isMobile}
          onClose={() => setShowPostSheet(false)}
          onPosted={() => {
            setShowPostSheet(false);
            setToast("Job posted. Eligible pickers nearby have been notified.");
            refreshBrowseJobs();
          }}
        />
      )}

      {showReminder && (
        <ReminderPopup
          onDismiss={dismissReminder}
          onNavigate={(v) => {
            setView(v);
            dismissReminder();
          }}
          pickedJobs={pickedJobs}
        />
      )}
    </div>
  );
}
