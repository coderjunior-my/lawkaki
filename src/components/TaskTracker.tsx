"use client";

import { useState, useEffect, CSSProperties } from "react";
import { PickedJob, getTodayISO, parseTimeToMins } from "@/lib/pickedJobs";
import { Job } from "@/lib/jobs";
import { Interest } from "@/lib/interests";

interface JobWithInterests extends Job {
  interests: Interest[];
}

/* ============================================================
   Icons
   ============================================================ */
interface IconProps { d: string | string[]; size?: number; sw?: number; style?: CSSProperties }
function Icon({ d, size = 16, sw = 2, style }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={style}
    >
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const I = {
  check:    "M20 6 9 17l-5-5",
  clock:    ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 7v5l3 2"],
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  alert:    ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  users:    ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  close:    "M18 6 6 18M6 6l12 12",
  chevR:    "m9 18 6-6-6-6",
  map:      ["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z", "M8 2v16", "M16 6v16"],
};

/* ============================================================
   Rating modal
   ============================================================ */
interface RatingValues {
  punctuality:     number;
  professionalism: number;
  completeness:    number;
}

function StarInput({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            style={{ background: "transparent", border: "none", padding: 2, cursor: "pointer" }}
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            <svg
              width={34} height={34} viewBox="0 0 24 24"
              fill={active >= s ? "var(--amber)" : "none"}
              stroke={active >= s ? "var(--amber)" : "var(--hair)"}
              strokeWidth={1.5}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function RatingModal({
  taskId, venue, pickerName, onClose, onDone,
}: {
  taskId: string; venue: string; pickerName: string;
  onClose: () => void; onDone: (taskId: string) => void;
}) {
  const [values, setValues] = useState<RatingValues>({ punctuality: 0, professionalism: 0, completeness: 0 });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const ready = values.punctuality > 0 && values.professionalism > 0 && values.completeness > 0;

  async function submit() {
    if (!ready) return;
    setBusy(true);
    // POST /api/jobs/:id/rate would go here
    await new Promise((r) => setTimeout(r, 700));
    setDone(true);
    setTimeout(() => { onDone(taskId); onClose(); }, 1400);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,31,51,0.45)",
        zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF", borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 480, padding: "8px 0 0",
          boxShadow: "0 -8px 40px -8px rgba(15,31,51,0.22)",
        }}
      >
        <div style={{ width: 40, height: 4, background: "var(--hair)", borderRadius: 999, margin: "0 auto 20px" }} />
        <div style={{ padding: "0 24px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>How did it go?</div>
              <div style={{ fontSize: 13, color: "var(--warm-grey)", marginTop: 3 }}>
                {pickerName} · {venue}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--warm-grey)", padding: 4 }}
            >
              <Icon d={I.close} size={18} />
            </button>
          </div>

          {done ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 60, color: "#1F8A5B", fontWeight: 700, fontSize: 15 }}>
              <Icon d={I.check} size={20} sw={2.5} />
              Rating submitted. Terima kasih!
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 26, marginBottom: 28 }}>
                <StarInput
                  label="Punctuality — did they arrive on time?"
                  value={values.punctuality}
                  onChange={(v) => setValues({ ...values, punctuality: v })}
                />
                <StarInput
                  label="Professionalism — did they represent the firm well?"
                  value={values.professionalism}
                  onChange={(v) => setValues({ ...values, professionalism: v })}
                />
                <StarInput
                  label="Completeness — were all documents handled correctly?"
                  value={values.completeness}
                  onChange={(v) => setValues({ ...values, completeness: v })}
                />
              </div>
              <button
                className={`lk-btn ${ready ? "lk-btn--accent" : "lk-btn--secondary"}`}
                disabled={!ready || busy}
                onClick={submit}
                style={{ width: "100%", height: 48 }}
              >
                {busy ? "Submitting…" : "Submit rating"}
              </button>
              {!ready && (
                <p style={{ fontSize: 12, color: "var(--warm-grey)", textAlign: "center", margin: "8px 0 0" }}>
                  Rate all three to submit.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Section header
   ============================================================ */
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 2px 4px" }}>
      <span style={{
        fontSize: 10.5, fontWeight: 700, color: "var(--warm-grey)",
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        {title}
      </span>
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700, background: "var(--amber)", color: "var(--black)",
          borderRadius: 999, padding: "1px 7px", lineHeight: 1.6,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   Action task card
   ============================================================ */
type TaskType = "confirm" | "rate" | "no-taker";

interface ActionTask {
  id:      string;
  type:    TaskType;
  venue:   string;
  detail:  string;
  time?:   string;
  meta?:   string;
}

const TASK_STYLE: Record<TaskType, { icon: string | string[]; iconBg: string; iconColor: string; border: string; bg: string }> = {
  "no-taker": {
    icon: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
    iconBg: "#F9DDB4", iconColor: "#7A4A0F", border: "#F9DDB4", bg: "#FEF9EE",
  },
  confirm: {
    icon: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
    iconBg: "#F9DDB4", iconColor: "#7A4A0F", border: "#F9DDB4", bg: "#FEF9EE",
  },
  rate: {
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    iconBg: "var(--pale-grey)", iconColor: "var(--black)", border: "var(--hair)", bg: "#FFFFFF",
  },
};

function ActionTaskCard({
  task, ctaLabel, onCta,
}: {
  task: ActionTask; ctaLabel: string; onCta: () => void;
}) {
  const s = TASK_STYLE[task.type];
  const isAmber = task.type !== "rate";
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: s.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon d={s.icon} size={16} sw={2} style={{ color: s.iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--black)", lineHeight: 1.3 }}>{task.venue}</div>
        <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 2 }}>
          {task.detail}
          {task.time && <> · <span style={{ fontVariantNumeric: "tabular-nums" }}>{task.time}</span></>}
        </div>
        <button
          className="lk-btn lk-btn--sm"
          onClick={onCta}
          style={{
            marginTop: 10, height: 30, fontSize: 11,
            background: isAmber ? "var(--amber)" : "var(--black)",
            borderColor: isAmber ? "var(--amber)" : "var(--black)",
            color: isAmber ? "var(--black)" : "var(--off-white)",
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Appointment row (today / coming up)
   ============================================================ */
function AppointmentRow({ job, index, showIndex }: { job: PickedJob; index?: number; showIndex?: boolean }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 12,
      padding: "12px 14px", display: "flex", gap: 12, alignItems: "center",
    }}>
      {showIndex && index !== undefined ? (
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: "var(--pale-grey)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontSize: 13, fontWeight: 800, color: "var(--black)", fontVariantNumeric: "tabular-nums",
        }}>
          {index + 1}
        </div>
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: "var(--pale-grey)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon d={I.clock} size={16} sw={2} style={{ color: "var(--warm-grey)" }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--black)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {job.venue}
        </div>
        <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 2 }}>
          {job.docType}
          {!showIndex && <> · {job.dateLabel}</>}
          {" · "}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{job.time}</span>
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--black)", flexShrink: 0 }}>
        RM {job.fee}
      </div>
    </div>
  );
}

/* ============================================================
   TaskTracker — main export
   ============================================================ */
export default function TaskTracker({
  token      = "",
  pickedJobs = [],
  onNavigate,
}: {
  token?:      string;
  pickedJobs?: PickedJob[];
  onNavigate?: (view: "browse" | "my-jobs" | "picked") => void;
}) {
  const [postedJobs, setPostedJobs] = useState<JobWithInterests[]>([]);
  const [dismissed, setDismissed]   = useState<Set<string>>(new Set());
  const [ratingTarget, setRatingTarget] = useState<{
    taskId: string; venue: string; pickerName: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/jobs/posted", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setPostedJobs(d.jobs ?? []))
      .catch(() => {});
  }, [token]);

  const todayISO = getTodayISO();

  /* ── Derive action tasks from posted jobs ── */
  const confirmTasks: ActionTask[] = postedJobs
    .filter((j) => j.state !== "taken" && j.interests.length > 0 && !dismissed.has(j.id))
    .map((j) => ({
      id:     j.id,
      type:   "confirm" as TaskType,
      venue:  j.venue,
      detail: `${j.interests.length} interested kaki${j.interests.length > 1 ? "s" : ""} · ${j.docType}`,
      time:   j.time,
    }));

  const noTakerTasks: ActionTask[] = postedJobs
    .filter((j) => j.state === "urgent" && j.interests.length === 0 && !dismissed.has(`nt-${j.id}`))
    .map((j) => ({
      id:     `nt-${j.id}`,
      type:   "no-taker" as TaskType,
      venue:  j.venue,
      detail: `No taker yet · ${j.docType}`,
      time:   j.time,
    }));

  /* ── Mock completed jobs needing rating ──
     In production these come from GET /api/jobs/completed-unrated.
     Kept here so the rating flow UI is visible during the pilot. ── */
  const rateTasks: ActionTask[] = ([
    {
      id:     "rate-demo-1",
      type:   "rate" as TaskType,
      venue:  "PJ Hilton",
      detail: "Loan documentation · 14 Jun",
      meta:   "Ahmad Firdaus",
    },
  ] as ActionTask[]).filter((t) => !dismissed.has(t.id));

  const actionTasks = [...noTakerTasks, ...confirmTasks, ...rateTasks];

  /* ── Derive appointment lists from picked jobs ── */
  const todayJobs = pickedJobs
    .filter((j) => j.dateISO === todayISO && j.status !== "awaiting")
    .sort((a, b) => parseTimeToMins(a.time) - parseTimeToMins(b.time));

  const upcomingJobs = pickedJobs
    .filter((j) => j.dateISO > todayISO && j.status === "confirmed")
    .sort((a, b) =>
      a.dateISO !== b.dateISO
        ? a.dateISO.localeCompare(b.dateISO)
        : parseTimeToMins(a.time) - parseTimeToMins(b.time)
    )
    .slice(0, 5);

  const totalActions = actionTasks.length;
  const isEmpty = totalActions === 0 && todayJobs.length === 0 && upcomingJobs.length === 0;

  return (
    <>
      {/* Header */}
      <div style={{
        padding: "14px 18px 10px", borderBottom: "1px solid var(--hair)",
        background: "#FFFFFF", flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>My tasks</div>
        <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 2 }}>
          {totalActions > 0
            ? `${totalActions} action${totalActions > 1 ? "s" : ""} needed`
            : todayJobs.length > 0
            ? `${todayJobs.length} appointment${todayJobs.length > 1 ? "s" : ""} today`
            : "You're all caught up."}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Action needed */}
        {actionTasks.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionHeader title="Action needed" count={totalActions} />
            {[...noTakerTasks, ...confirmTasks].map((t) => (
              <ActionTaskCard
                key={t.id}
                task={t}
                ctaLabel={t.type === "confirm" ? "See who's interested" : "Re-share to colleagues"}
                onCta={() => onNavigate?.("my-jobs")}
              />
            ))}
            {rateTasks.map((t) => (
              <ActionTaskCard
                key={t.id}
                task={t}
                ctaLabel={`Rate ${t.meta?.split(" ")[0] ?? "kaki"}`}
                onCta={() =>
                  setRatingTarget({ taskId: t.id, venue: t.venue, pickerName: t.meta! })
                }
              />
            ))}
          </div>
        )}

        {/* Today */}
        {todayJobs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionHeader title="Today" />
            {todayJobs.map((j, idx) => (
              <AppointmentRow key={j.id} job={j} index={idx} showIndex />
            ))}
            <button
              className="lk-btn lk-btn--ghost lk-btn--sm"
              onClick={() => onNavigate?.("picked")}
              style={{ alignSelf: "flex-start", height: 30, fontSize: 11, gap: 6 }}
            >
              <Icon d={I.map} size={12} />
              View route map
            </button>
          </div>
        )}

        {/* Coming up */}
        {upcomingJobs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionHeader title="Coming up" />
            {upcomingJobs.map((j) => (
              <AppointmentRow key={j.id} job={j} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999, background: "var(--pale-grey)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Icon d={I.check} size={24} sw={2.5} style={{ color: "var(--warm-grey)" }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--black)", marginBottom: 6 }}>
              All clear.
            </div>
            <div style={{ fontSize: 13, color: "var(--warm-grey)", lineHeight: 1.6 }}>
              No actions needed and nothing on the calendar.
            </div>
            <button
              className="lk-btn lk-btn--accent lk-btn--sm"
              onClick={() => onNavigate?.("browse")}
              style={{ marginTop: 20, height: 36 }}
            >
              Browse jobs
            </button>
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingTarget && (
        <RatingModal
          taskId={ratingTarget.taskId}
          venue={ratingTarget.venue}
          pickerName={ratingTarget.pickerName}
          onClose={() => setRatingTarget(null)}
          onDone={(id) => {
            setDismissed((prev) => new Set([...prev, id]));
            setRatingTarget(null);
          }}
        />
      )}
    </>
  );
}
