"use client";

import { useState, CSSProperties } from "react";

/* ============================================================
   Icons
   ============================================================ */
interface IP { d: string | string[]; size?: number; sw?: number; fill?: string; style?: CSSProperties }
function Icon({ d, size = 16, sw = 2, fill = "none", style }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={style}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}
const I = {
  check: "M20 6 9 17l-5-5",
  star:  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  clock: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 7v5l3 2"],
};

/* ============================================================
   Types
   ============================================================ */
type JobStep   = 0 | 1 | 2 | 3;
type UserRole  = "picker" | "poster";
type ReviewTab = "pending" | "given" | "received";

interface UpcomingJob {
  id:             string;
  venue:          string;
  docType:        string;
  dateLabel:      string;
  time:           string;
  fee:            number;
  step:           JobStep;
  role:           UserRole;
  otherName:      string;
  whatsappSentAt: Partial<Record<1 | 2, string>>;
  stepTimestamps: Partial<Record<JobStep, string>>;
  docsStatus:     "dispatched" | "pending" | "not-required";
  docsTracking?:  string;
}

interface PendingReview {
  id:        string;
  venue:     string;
  dateLabel: string;
  otherName: string;
  jobRole:   UserRole;
  fee:       number;
  docType:   string;
}

interface SubmittedReview {
  id:          string;
  venue:       string;
  dateLabel:   string;
  otherName:   string;
  jobRole:     UserRole;
  rating:      number;
  comment?:    string;
  submittedAt: string;
}

/* ============================================================
   Mock data
   ============================================================ */
const INITIAL_UPCOMING: UpcomingJob[] = [
  {
    id: "u1", venue: "Damansara Heights", docType: "SPA",
    dateLabel: "Today", time: "9:00 AM", fee: 200,
    step: 0, role: "picker", otherName: "Priya Nair",
    whatsappSentAt: {}, stepTimestamps: { 0: "8:45 AM" },
    docsStatus: "pending",
  },
  {
    id: "u2", venue: "KLCC", docType: "Loan docs",
    dateLabel: "Today", time: "2:30 PM", fee: 300,
    step: 2, role: "poster", otherName: "Ahmad Farid",
    whatsappSentAt: { 1: "2:35 PM", 2: "3:10 PM" },
    stepTimestamps: { 0: "Yesterday 4:00 PM", 1: "2:35 PM", 2: "3:10 PM" },
    docsStatus: "dispatched", docsTracking: "Runner: Razif · ETA 4:00 PM",
  },
  {
    id: "u3", venue: "Mont Kiara", docType: "MOT",
    dateLabel: "Tomorrow", time: "11:00 AM", fee: 250,
    step: 1, role: "picker", otherName: "Lim Wei Jie",
    whatsappSentAt: { 1: "Yesterday 3:00 PM" },
    stepTimestamps: { 0: "Yesterday 2:00 PM", 1: "Yesterday 3:00 PM" },
    docsStatus: "not-required",
  },
];

const INITIAL_PENDING: PendingReview[] = [
  { id: "pr1", venue: "PJ Hilton",     dateLabel: "14 Jun", otherName: "Ahmad Firdaus", jobRole: "picker", fee: 200, docType: "SPA"  },
  { id: "pr2", venue: "Bangsar South", dateLabel: "16 Jun", otherName: "Siti Rahimah",  jobRole: "picker", fee: 150, docType: "MOT"  },
];
const INITIAL_GIVEN: SubmittedReview[] = [
  { id: "gr1", venue: "Subang Jaya", dateLabel: "10 Jun", otherName: "Rohan Krishnan",
    jobRole: "picker", rating: 5, comment: "Excellent work. Very professional.", submittedAt: "11 Jun" },
];
const INITIAL_RECEIVED: SubmittedReview[] = [
  { id: "rr1", venue: "Petaling Jaya", dateLabel: "8 Jun", otherName: "Nurul Ain",
    jobRole: "poster", rating: 4, comment: "Arrived on time, handled docs well.", submittedAt: "9 Jun" },
];

/* ============================================================
   Helpers
   ============================================================ */
const STEP_LABELS = ["Scheduled", "Signing completed", "Runner collected docs", "Poster confirmed"];
const STAR_LABELS: Record<number, string> = {
  1: "Needs improvement", 2: "Below expectations", 3: "Satisfactory", 4: "Good kaki", 5: "Excellent kaki",
};

function ini(n: string) { return n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"; }

/* ============================================================
   Toast
   ============================================================ */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useState(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); });
  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      background: "var(--black)", color: "#fff", borderRadius: 100, padding: "10px 20px",
      fontSize: 13, fontWeight: 600, boxShadow: "0 4px 24px rgba(0,0,0,.18)",
      zIndex: 400, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8,
    }}>
      <Icon d={I.check} size={14} sw={2.5} style={{ color: "#4ADE80" }} />
      {message}
    </div>
  );
}

/* ============================================================
   Avatar
   ============================================================ */
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--black)", color: "#fff", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, letterSpacing: "-0.02em",
    }}>{ini(name)}</div>
  );
}

/* ============================================================
   Chip
   ============================================================ */
function Chip({ label, color = "default" }: { label: string; color?: "default" | "navy" }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, lineHeight: 1.7,
      background: color === "navy" ? "var(--black)" : "var(--pale-grey)",
      color:      color === "navy" ? "#fff"          : "var(--warm-grey)",
    }}>{label}</span>
  );
}

/* ============================================================
   Document dispatch status bar
   ============================================================ */
function DocDispatchBar({
  status, tracking, onRemind,
}: {
  status: "dispatched" | "pending" | "not-required";
  tracking?: string;
  onRemind?: () => void;
}) {
  if (status === "not-required") return null;
  const dispatched = status === "dispatched";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderRadius: 8, marginBottom: 10,
      background: dispatched ? "#F0FDF4" : "#FFFBEB",
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: dispatched ? "#25D366" : "var(--amber)",
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: dispatched ? "#15803D" : "#92400E" }}>
          {dispatched ? "Documents dispatched" : "Awaiting document dispatch"}
        </div>
        {tracking && (
          <div style={{ fontSize: 11, color: "#15803D", marginTop: 1 }}>{tracking}</div>
        )}
      </div>
      {!dispatched && (
        <button onClick={onRemind} style={{
          background: "transparent", border: "1px solid var(--amber)", borderRadius: 6,
          padding: "3px 8px", fontSize: 11, fontWeight: 600, color: "#92400E", cursor: "pointer",
        }}>Remind poster</button>
      )}
    </div>
  );
}

/* ============================================================
   Vertical stepper
   ============================================================ */
function VerticalStepper({ step, whatsappSentAt, stepTimestamps }: {
  step: JobStep;
  whatsappSentAt: Partial<Record<1 | 2, string>>;
  stepTimestamps: Partial<Record<JobStep, string>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {STEP_LABELS.map((label, i) => {
        const done    = i < step;
        const current = i === step;
        const isLast  = i === STEP_LABELS.length - 1;
        const waTime  = i === 1 ? whatsappSentAt[1] : i === 2 ? whatsappSentAt[2] : undefined;
        const ts      = stepTimestamps[i as JobStep];

        return (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            {/* Dot + connector column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: done ? "#16A34A" : current ? "var(--amber)" : "#fff",
                border: done || current ? "none" : "2px dashed var(--hair)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 300ms",
              }}>
                {done && (
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {current && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 18,
                  background: done ? "#16A34A" : "transparent",
                  borderLeft: done ? "none" : "2px dashed var(--hair)",
                  margin: "2px 0",
                }} />
              )}
            </div>

            {/* Label + meta column */}
            <div style={{ paddingBottom: isLast ? 0 : 14, flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, lineHeight: 1.3,
                fontWeight: current ? 700 : done ? 600 : 500,
                color: done ? "#16A34A" : current ? "var(--black)" : "var(--warm-grey)",
              }}>
                {label}
              </div>
              {(done || current) && ts && (
                <div style={{ fontSize: 10.5, color: "var(--warm-grey)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                  {ts}
                </div>
              )}
              {waTime && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, color: "var(--warm-grey)" }}>WhatsApp sent · {waTime}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Upcoming job card
   ============================================================ */
function UpcomingJobCard({
  job, onAdvance,
}: {
  job: UpcomingJob;
  onAdvance: (id: string, next: JobStep, waStep?: 1 | 2) => void;
}) {
  const isDone = job.step === 3;

  const actionBtn = (() => {
    if (isDone) return null;
    if (job.role === "picker") {
      if (job.step === 0) return { label: "Mark signing done",     next: 1 as JobStep, wa: 1 as 1 | 2 };
      if (job.step === 1) return { label: "Runner collected docs",  next: 2 as JobStep, wa: 2 as 1 | 2 };
      return null;
    }
    if (job.role === "poster" && job.step === 2)
      return { label: "Confirm docs received", next: 3 as JobStep, wa: undefined };
    return null;
  })();

  const waitMsg = (() => {
    if (job.role === "picker" && job.step === 2) return "Waiting for poster to confirm receipt";
    if (job.role === "poster" && job.step < 2)   return "Waiting for picker to complete";
    return null;
  })();

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isDone ? "var(--pale-grey)" : "var(--hair)"}`,
      borderRadius: 14, padding: "14px 14px 12px",
      opacity: isDone ? 0.75 : 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--black)" }}>{job.venue}</span>
            <Chip label={job.role === "picker" ? "Picking" : "Posted"} color={job.role === "picker" ? "navy" : "default"} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--warm-grey)" }}>
            {job.docType}
            {" · "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{job.dateLabel} · {job.time}</span>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "var(--black)", flexShrink: 0, marginLeft: 12 }}>
          RM {job.fee}
        </div>
      </div>

      {/* Counterparty */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
        borderRadius: 8, background: "var(--pale-grey)", marginBottom: 12,
      }}>
        <Avatar name={job.otherName} size={22} />
        <span style={{ fontSize: 12, color: "var(--warm-grey)" }}>
          {job.role === "picker" ? "Posted by" : "Picked by"}{" "}
          <span style={{ fontWeight: 600, color: "var(--black)" }}>{job.otherName}</span>
        </span>
      </div>

      {/* Doc dispatch */}
      <DocDispatchBar status={job.docsStatus} tracking={job.docsTracking} />

      {/* Vertical stepper */}
      <VerticalStepper
        step={job.step}
        whatsappSentAt={job.whatsappSentAt}
        stepTimestamps={job.stepTimestamps}
      />

      {/* Action button */}
      {actionBtn && (
        <button
          className="lk-btn lk-btn--accent"
          onClick={() => onAdvance(job.id, actionBtn.next, actionBtn.wa)}
          style={{ width: "100%", height: 40, fontSize: 13, marginTop: 12 }}
        >
          {actionBtn.label}
        </button>
      )}

      {waitMsg && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 10,
          fontSize: 12, color: "var(--warm-grey)", fontStyle: "italic",
        }}>
          <Icon d={I.clock} size={12} sw={1.5} />
          {waitMsg}
        </div>
      )}

      {isDone && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 10,
          fontSize: 12.5, color: "#16A34A", fontWeight: 700,
        }}>
          <Icon d={I.check} size={14} sw={2.5} style={{ color: "#16A34A" }} />
          Job complete
        </div>
      )}

      {/* View details ghost */}
      <button
        className="lk-btn lk-btn--ghost lk-btn--sm"
        style={{ width: "100%", height: 32, fontSize: 12, marginTop: 10 }}
      >
        View details
      </button>
    </div>
  );
}

/* ============================================================
   Upcoming tab
   ============================================================ */
function UpcomingTab({
  jobs, onAdvance,
}: {
  jobs: UpcomingJob[];
  onAdvance: (id: string, next: JobStep, waStep?: 1 | 2) => void;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState icon={I.clock} title="Nothing coming up." sub="Jobs you pick will appear here." />
    );
  }

  const groups: Record<string, UpcomingJob[]> = {};
  for (const j of jobs) (groups[j.dateLabel] ??= []).push(j);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "12px 10px 24px" }}>
      {Object.entries(groups).map(([label, grpJobs]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--warm-grey)", paddingLeft: 2,
          }}>
            {label}
          </div>
          {grpJobs.map(j => <UpcomingJobCard key={j.id} job={j} onAdvance={onAdvance} />)}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Star picker — 44×44px touch targets per spec
   ============================================================ */
function StarPicker({ value, onChange, roleSuffix }: {
  value: number; onChange: (v: number) => void; roleSuffix: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            style={{
              width: 44, height: 44, background: "transparent", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label={`${s} star`}
          >
            <svg width={32} height={32} viewBox="0 0 24 24"
              fill={active >= s ? "var(--amber)" : "none"}
              stroke={active >= s ? "var(--amber)" : "var(--hair)"}
              strokeWidth={1.5}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)", marginTop: 2 }}>
          {STAR_LABELS[active]} — {roleSuffix}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Pending review card — inline expand
   ============================================================ */
function PendingReviewCard({
  review, onSubmit,
}: {
  review: PendingReview;
  onSubmit: (id: string, rating: number, comment: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState("");
  const [busy, setBusy]         = useState(false);

  const isPoster  = review.jobRole === "poster";
  const ctaLabel  = isPoster ? "Rate your picker" : "Rate the poster";
  const question  = isPoster ? "How was your picking kaki?" : "How was the posting kaki?";
  const roleSuffix = isPoster ? "as poster" : "as picker";
  const placeholder = isPoster
    ? "e.g. Arrived on time, thorough with the documents. Would use again."
    : "e.g. Clear brief, documents were ready on time. Smooth job.";

  async function submit() {
    if (!rating) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 600));
    onSubmit(review.id, rating, comment);
  }

  return (
    <div style={{
      background: "#fff", border: "1px solid var(--hair)",
      borderRadius: 14, padding: "13px 14px",
    }}>
      {/* Card header — always visible */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={review.otherName} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--black)" }}>{review.otherName}</div>
          <div style={{ fontSize: 11.5, color: "var(--warm-grey)" }}>
            {review.venue}
            {" · "}
            {review.dateLabel}
            {" · "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>RM {review.fee}</span>
          </div>
          <div style={{ marginTop: 5, display: "flex", gap: 5 }}>
            <Chip label={isPoster ? "You posted · Rate picker" : "You picked · Rate poster"} color="default" />
          </div>
        </div>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="lk-btn lk-btn--accent lk-btn--sm"
            style={{ flexShrink: 0, height: 32, fontSize: 11.5 }}
          >
            {ctaLabel}
          </button>
        )}
      </div>

      {/* Inline form — expands on click */}
      {expanded && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>{question}</div>
          <StarPicker value={rating} onChange={setRating} roleSuffix={roleSuffix} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid var(--hair)", borderRadius: 8,
              padding: "9px 12px", fontSize: 12.5, color: "var(--black)",
              background: "#FAFAF9", resize: "none", outline: "none",
              fontFamily: "inherit", lineHeight: 1.5,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`lk-btn ${rating ? "lk-btn--accent" : "lk-btn--secondary"}`}
              disabled={!rating || busy}
              onClick={submit}
              style={{ flex: 1, height: 40, fontSize: 13 }}
            >
              {busy ? "Submitting…" : "Submit"}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="lk-btn lk-btn--ghost"
              style={{ height: 40, fontSize: 13, padding: "0 16px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Submitted review card (Given / Received)
   ============================================================ */
function SubmittedReviewCard({
  review, direction,
}: {
  review: SubmittedReview;
  direction: "given" | "received";
}) {
  const roleTag = direction === "given"
    ? `Reviewed as ${review.jobRole}`
    : `Review from ${review.jobRole}`;

  return (
    <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Avatar name={review.otherName} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--black)" }}>{review.otherName}</div>
            <div style={{ fontSize: 11.5, color: "var(--warm-grey)" }}>{review.venue} · {review.dateLabel}</div>
          </div>
          <div style={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <svg key={s} width={12} height={12} viewBox="0 0 24 24"
                fill={s <= review.rating ? "var(--amber)" : "none"}
                stroke={s <= review.rating ? "var(--amber)" : "var(--hair)"}
                strokeWidth={1.5}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
        {review.comment && (
          <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 5, lineHeight: 1.5, fontStyle: "italic" }}>
            "{review.comment}"
          </div>
        )}
        <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
          <Chip label={roleTag} color="default" />
          <span style={{ fontSize: 10.5, color: "var(--hair)" }}>· {review.submittedAt}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Reviews tab
   ============================================================ */
function ReviewsTab({
  pending, given, received, onSubmit,
}: {
  pending:  PendingReview[];
  given:    SubmittedReview[];
  received: SubmittedReview[];
  onSubmit: (id: string, rating: number, comment: string) => void;
}) {
  const [sub, setSub] = useState<ReviewTab>("pending");

  const SUB_TABS: { id: ReviewTab; label: string; count?: number }[] = [
    { id: "pending",  label: "Pending",  count: pending.length },
    { id: "given",    label: "Given",    count: given.length },
    { id: "received", label: "Received", count: received.length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--hair)", paddingLeft: 10, flexShrink: 0 }}>
        {SUB_TABS.map(({ id, label, count }) => (
          <button key={id} onClick={() => setSub(id)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "10px 14px", fontSize: 12.5,
            fontWeight: sub === id ? 700 : 500,
            color: sub === id ? "var(--black)" : "var(--warm-grey)",
            borderBottom: sub === id ? "2px solid var(--black)" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: 5, transition: "all 120ms",
          }}>
            {label}
            {count !== undefined && count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "0 6px", lineHeight: 1.7,
                background: id === "pending" ? "var(--amber)" : "var(--pale-grey)",
                color:      id === "pending" ? "var(--black)" : "var(--warm-grey)",
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px 24px" }}>
        {sub === "pending" && (
          pending.length === 0
            ? <EmptyState icon={I.star} title="No pending reviews." sub="You're all caught up." />
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map(r => <PendingReviewCard key={r.id} review={r} onSubmit={onSubmit} />)}
              </div>
        )}
        {sub === "given" && (
          given.length === 0
            ? <EmptyState icon={I.star} title="No reviews given yet." sub="Reviews you submit will appear here." />
            : <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
                {given.map((r, i) => (
                  <div key={r.id}>
                    {i > 0 && <div style={{ height: 1, background: "var(--hair)" }} />}
                    <SubmittedReviewCard review={r} direction="given" />
                  </div>
                ))}
              </div>
        )}
        {sub === "received" && (
          received.length === 0
            ? <EmptyState icon={I.star} title="No reviews yet." sub="Reviews from colleagues will show here." />
            : <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
                {received.map((r, i) => (
                  <div key={r.id}>
                    {i > 0 && <div style={{ height: 1, background: "var(--hair)" }} />}
                    <SubmittedReviewCard review={r} direction="received" />
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Empty state
   ============================================================ */
function EmptyState({ icon, title, sub }: { icon: string | string[]; title: string; sub: string }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{
        width: 48, height: 48, borderRadius: 999, background: "var(--pale-grey)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
      }}>
        <Icon d={icon} size={20} sw={1.5} style={{ color: "var(--warm-grey)" }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--black)", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--warm-grey)" }}>{sub}</div>
    </div>
  );
}

/* ============================================================
   TaskTracker — main export
   ============================================================ */
export default function TaskTracker({
  onNavigate,
}: {
  token?:      string;
  pickedJobs?: unknown[];
  onNavigate?: (view: "browse" | "my-jobs" | "picked") => void;
}) {
  const [tab, setTab]       = useState<"upcoming" | "reviews">("upcoming");
  const [jobs, setJobs]     = useState<UpcomingJob[]>(INITIAL_UPCOMING);
  const [pending, setPending] = useState<PendingReview[]>(INITIAL_PENDING);
  const [given, setGiven]   = useState<SubmittedReview[]>(INITIAL_GIVEN);
  const [received]          = useState<SubmittedReview[]>(INITIAL_RECEIVED);
  const [toast, setToast]   = useState<string | null>(null);

  function advanceStep(id: string, next: JobStep, waStep?: 1 | 2) {
    const job = jobs.find(j => j.id === id);
    setJobs(prev => prev.map(j => j.id !== id ? j : {
      ...j,
      step: next,
      stepTimestamps: { ...j.stepTimestamps, [next]: "Just now" },
      whatsappSentAt: waStep ? { ...j.whatsappSentAt, [waStep]: "Just now" } : j.whatsappSentAt,
    }));
    if (waStep && job) {
      const firstName = job.otherName.split(" ")[0];
      setToast(`Signing marked as done. ${firstName} notified via WhatsApp.`);
    } else if (next === 3) {
      setToast("Job confirmed. Well done, kaki!");
    }
  }

  function submitReview(id: string, rating: number, comment: string) {
    const r = pending.find(p => p.id === id);
    if (!r) return;
    setPending(prev => prev.filter(p => p.id !== id));
    setGiven(prev => [{
      id, venue: r.venue, dateLabel: r.dateLabel,
      otherName: r.otherName, jobRole: r.jobRole,
      rating, comment: comment || undefined, submittedAt: "Today",
    }, ...prev]);
    setToast(`Review submitted for ${r.otherName.split(" ")[0]}. Terima kasih, kaki.`);
  }

  const MAIN_TABS = [
    { id: "upcoming" as const, label: "Upcoming", count: jobs.filter(j => j.step < 3).length },
    { id: "reviews"  as const, label: "Reviews",  count: pending.length },
  ];

  return (
    <>
      {/* Header */}
      <div style={{
        padding: "14px 18px 0", borderBottom: "1px solid var(--hair)",
        background: "#fff", flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>
          My tasks
        </div>
        <div style={{ display: "flex" }}>
          {MAIN_TABS.map(({ id, label, count }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "8px 16px 10px", fontSize: 13.5,
              fontWeight: tab === id ? 700 : 500,
              color: tab === id ? "var(--black)" : "var(--warm-grey)",
              borderBottom: tab === id ? "2px solid var(--black)" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: 5, transition: "all 120ms",
            }}>
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "0 6px", lineHeight: 1.7,
                  background: "var(--amber)", color: "var(--black)",
                }}>{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {tab === "upcoming"
          ? <UpcomingTab jobs={jobs} onAdvance={advanceStep} />
          : <ReviewsTab pending={pending} given={given} received={received} onSubmit={submitReview} />
        }
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
