"use client";

import { useState, useEffect } from "react";
import { Job } from "@/lib/jobs";
import { Interest, PickerProfile } from "@/lib/interests";
import { PickedJob } from "@/lib/pickedJobs";
import { PendingReview } from "@/lib/reviews";
import { PostedJobCard, PickerProfileModal } from "@/components/MyJobs";
import { PickedJobCard } from "@/components/MyPickedJobs";
import CircularLoader from "@/components/CircularLoader";
import type { TaskTab } from "@/lib/notificationActions";

interface PostedJobWithInterests extends Job {
  interests: Interest[];
}

const REVIEW_MAX_WORDS = 1000;

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

function capWords(text: string, maxWords: number): string {
  return countWords(text) <= maxWords ? text : text.trim().split(/\s+/).slice(0, maxWords).join(" ");
}

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

/* KitKat bar — the right finger gently rocks, as if it just snapped off */
function KitKatIcon() {
  return (
    <svg width={44} height={28} viewBox="0 0 32 20" fill="none" aria-hidden>
      <rect x="2" y="2" width="12" height="16" rx="3" stroke="var(--warm-grey)" strokeWidth="2" />
      <line x1="5" y1="7" x2="11" y2="7" stroke="var(--warm-grey)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="13" x2="11" y2="13" stroke="var(--warm-grey)" strokeWidth="1.5" strokeLinecap="round" />
      <g className="lk-kitkat-piece">
        <rect x="17" y="2" width="12" height="16" rx="3" stroke="var(--black)" strokeWidth="2" />
        <line x1="20" y1="7" x2="26" y2="7" stroke="var(--black)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="13" x2="26" y2="13" stroke="var(--black)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ============================================================
   Tab bar — Needs your confirmation / Jobs to work on / Give review
   Each tab's own count uses a neutral badge; the header keeps the
   single amber accent for the grand total.
   ============================================================ */
function TabBar({ active, counts, onChange }: {
  active: TaskTab;
  counts: Record<TaskTab, number>;
  onChange: (tab: TaskTab) => void;
}) {
  const TABS: { id: TaskTab; label: string }[] = [
    { id: "confirm", label: "Needs your confirmation" },
    { id: "work",    label: "Jobs to work on" },
    { id: "review",  label: "Give review" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, padding: "12px 18px", overflowX: "auto" }}>
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        const count = counts[id];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 999, whiteSpace: "nowrap",
              border: `1px solid ${isActive ? "var(--black)" : "var(--hair)"}`,
              background: isActive ? "var(--black)" : "#fff",
              color: isActive ? "var(--off-white)" : "var(--black)",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {label}
            {count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "0 6px", lineHeight: 1.6,
                background: isActive ? "rgba(255,255,255,0.25)" : "var(--pale-grey)",
                color: isActive ? "var(--off-white)" : "var(--black)",
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Empty state — plain text (KitKat is reserved for "Jobs to work on")
   ============================================================ */
function EmptyNote({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--black)", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--warm-grey)" }}>{sub}</div>
    </div>
  );
}

/* ============================================================
   Star row — interactive 1-5 input for one rating dimension
   ============================================================ */
function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 12, color: "var(--warm-grey)", width: 110, flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label={`${s} star`}
          >
            <svg width={18} height={18} viewBox="0 0 24 24"
              fill={active >= s ? "var(--amber)" : "none"}
              stroke={active >= s ? "var(--amber)" : "var(--hair)"}
              strokeWidth={1.5}>
              <path d={STAR_PATH} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Pending review card — expands into a 3-dimension rating form
   ============================================================ */
function PendingReviewCard({
  review, token, onSubmitted,
}: {
  review: PendingReview;
  token: string;
  onSubmitted: (jobId: string) => void;
}) {
  const [expanded, setExpanded]   = useState(false);
  const [punctuality, setPunctuality]         = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [completeness, setCompleteness]       = useState(0);
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const isPoster = review.role === "poster";
  const question = isPoster ? "How was your picking kaki?" : "How was the posting kaki?";
  const ctaLabel = isPoster ? "Rate the picker" : "Rate the poster";
  const allRated = punctuality > 0 && professionalism > 0 && completeness > 0;

  async function submit() {
    if (!allRated) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ jobId: review.id, punctuality, professionalism, completeness, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to submit review.");
        setSubmitting(false);
        return;
      }
      onSubmitted(review.id);
    } catch {
      setError("Failed to submit review. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: "#fff", border: `1px solid ${expanded ? "var(--amber)" : "var(--hair)"}`,
      borderRadius: 14, padding: "14px 16px", transition: "border-color 140ms",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="lk-avatar" style={{ width: 36, height: 36, fontSize: 13, background: "var(--black)", color: "var(--off-white)", flexShrink: 0 }}>
          {review.counterparty.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--black)" }}>{review.counterparty.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--warm-grey)" }}>{review.venue} · {review.dateLabel}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>RM {review.fee}</div>
      </div>

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="lk-btn lk-btn--accent lk-btn--sm"
          style={{ width: "100%", height: 36, fontSize: 12.5, marginTop: 12 }}
        >
          {ctaLabel}
        </button>
      ) : (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--pale-grey)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>{question}</div>
          <StarRow label="Punctuality"     value={punctuality}     onChange={setPunctuality} />
          <StarRow label="Professionalism" value={professionalism} onChange={setProfessionalism} />
          <StarRow label="Completeness"    value={completeness}    onChange={setCompleteness} />
          <textarea
            value={note}
            onChange={(e) => setNote(capWords(e.target.value, REVIEW_MAX_WORDS))}
            placeholder="Comments (optional)"
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box", border: "1px solid var(--hair)", borderRadius: 8,
              padding: "9px 12px", fontSize: 12.5, color: "var(--black)", background: "#FAFAF9",
              resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5,
            }}
          />
          <div style={{ fontSize: 11, color: "var(--warm-grey)", textAlign: "right", marginTop: -6 }}>
            {countWords(note)}/{REVIEW_MAX_WORDS} words
          </div>
          {error && <p style={{ color: "var(--red)", fontSize: 12, fontWeight: 600, margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`lk-btn ${allRated ? "lk-btn--accent" : "lk-btn--secondary"}`}
              disabled={!allRated || submitting}
              onClick={submit}
              style={{ flex: 1, height: 38, fontSize: 12.5 }}
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="lk-btn lk-btn--ghost"
              style={{ height: 38, fontSize: 12.5, padding: "0 14px" }}
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
   TaskTracker — main export
   Three kinds of task: (1) posted jobs with pickers waiting on your
   confirmation, (2) confirmed jobs you (as picker) need to work on,
   (3) completed jobs you haven't reviewed yet.
   ============================================================ */
export default function TaskTracker({
  token = "",
  pickedJobs = [],
  onNavigate,
  initialTab,
  isMobile = false,
}: {
  token?:      string;
  pickedJobs?: PickedJob[];
  onNavigate?: (view: "browse" | "my-jobs" | "picked") => void;
  // Set by a notification click-through (e.g. "interest_received" opens
  // straight to the confirm tab) — see src/lib/notificationActions.ts.
  initialTab?: TaskTab;
  isMobile?:   boolean;
}) {
  // Dashboard only ever renders TaskTracker inside a view switch, so it
  // unmounts/remounts on every visit to "tasks" — this lazy initial state
  // is enough to land on the right tab for a notification click-through
  // without needing an effect to re-sync it.
  const [activeTab, setActiveTab] = useState<TaskTab>(initialTab ?? "confirm");
  const [postedJobs, setPostedJobs] = useState<PostedJobWithInterests[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loadingPosted, setLoadingPosted] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [expandedPostedId, setExpandedPostedId] = useState<string | null>(null);
  const [expandedPickedId, setExpandedPickedId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{ picker: PickerProfile; jobId: string } | null>(null);
  // Optimistic overrides after confirm/cancel/complete, same pattern as MyJobs.tsx
  const [stateOverrides, setStateOverrides] = useState<Record<string, Job["state"]>>({});

  useEffect(() => {
    fetch("/api/jobs/posted", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => { setPostedJobs(d.jobs ?? []); setLoadingPosted(false); })
      .catch(() => setLoadingPosted(false));

    fetch("/api/reviews/pending", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => { setPendingReviews(d.reviews ?? []); setLoadingReviews(false); })
      .catch(() => setLoadingReviews(false));
  }, [token]);

  function effectiveState(job: PostedJobWithInterests): Job["state"] {
    return stateOverrides[job.id] ?? job.state;
  }

  function setOverride(jobId: string, state: Job["state"]) {
    setStateOverrides((prev) => ({ ...prev, [jobId]: state }));
  }

  const needsConfirmation = postedJobs
    .filter((j) => {
      const s = effectiveState(j);
      return (s === "open" || s === "urgent") && j.interests.length > 0;
    })
    .sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt));

  const toWorkOn = pickedJobs
    .filter((j) => j.status === "confirmed")
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  const loading = loadingPosted || loadingReviews;
  const counts: Record<TaskTab, number> = {
    confirm: needsConfirmation.length,
    work: toWorkOn.length,
    review: pendingReviews.length,
  };
  const totalTasks = counts.confirm + counts.work + counts.review;

  return (
    <>
      {/* Header */}
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--hair)",
        background: "#fff", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {onNavigate && (
          <button
            onClick={() => onNavigate("browse")}
            aria-label="Back to dashboard"
            title="Back to dashboard"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, marginLeft: -6,
              background: "transparent", border: "none", borderRadius: 999,
              color: "var(--black)", cursor: "pointer", flexShrink: 0,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>My tasks</div>
        {totalTasks > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "0 6px", lineHeight: 1.7,
            background: "var(--amber)", color: "var(--black)",
          }}>{totalTasks}</span>
        )}
      </div>

      {/* Tabs */}
      {!loading && <TabBar active={activeTab} counts={counts} onChange={setActiveTab} />}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
            <CircularLoader size={120} label="Loading your tasks…" />
          </div>
        ) : activeTab === "confirm" ? (
          needsConfirmation.length === 0 ? (
            <EmptyNote title="No pending confirmations." sub="Nice and clear." />
          ) : (
            <div
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "0 18px",
                // Extra clearance below the last card so a phone browser's
                // floating bottom bar doesn't sit on top of it.
                paddingBottom: isMobile ? "max(24px, env(safe-area-inset-bottom))" : "24px",
              }}
            >
              {needsConfirmation.map((job) => {
                const state = effectiveState(job);
                return (
                  <PostedJobCard
                    key={job.id}
                    job={state === job.state ? job : { ...job, state }}
                    interests={job.interests}
                    expanded={expandedPostedId === job.id}
                    onToggle={() => setExpandedPostedId((prev) => (prev === job.id ? null : job.id))}
                    onViewProfile={(picker, jobId) => setModalData({ picker, jobId })}
                    token={token}
                    onCancelled={(id) => setOverride(id, "cancelled")}
                    onCompleted={(id) => setOverride(id, "completed")}
                  />
                );
              })}
            </div>
          )
        ) : activeTab === "work" ? (
          toWorkOn.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <KitKatIcon />
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--black)", marginTop: 16, marginBottom: 4 }}>
                Nothing on today.
              </div>
              <div style={{ fontSize: 12.5, color: "var(--warm-grey)" }}>Enjoy the break, kaki.</div>
            </div>
          ) : (
            <div
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "0 18px",
                // Extra clearance below the last card so a phone browser's
                // floating bottom bar doesn't sit on top of it.
                paddingBottom: isMobile ? "max(24px, env(safe-area-inset-bottom))" : "24px",
              }}
            >
              {toWorkOn.map((job) => (
                <PickedJobCard
                  key={job.id}
                  job={job}
                  expanded={expandedPickedId === job.id}
                  onToggle={() => setExpandedPickedId((prev) => (prev === job.id ? null : job.id))}
                />
              ))}
            </div>
          )
        ) : (
          pendingReviews.length === 0 ? (
            <EmptyNote title="No reviews pending." sub="You're all caught up." />
          ) : (
            <div
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "0 18px",
                // Extra clearance below the last card so a phone browser's
                // floating bottom bar doesn't sit on top of it.
                paddingBottom: isMobile ? "max(24px, env(safe-area-inset-bottom))" : "24px",
              }}
            >
              {pendingReviews.map((review) => (
                <PendingReviewCard
                  key={review.id}
                  review={review}
                  token={token}
                  onSubmitted={(jobId) => setPendingReviews((prev) => prev.filter((r) => r.id !== jobId))}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Picker profile modal — confirming from here removes the job from "Needs your confirmation" */}
      {modalData && (
        <PickerProfileModal
          picker={modalData.picker}
          jobId={modalData.jobId}
          onClose={() => setModalData(null)}
          onConfirmed={() => setOverride(modalData.jobId, "taken")}
        />
      )}
    </>
  );
}
