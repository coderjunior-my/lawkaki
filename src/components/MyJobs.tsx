"use client";

import { useState, useEffect, CSSProperties } from "react";
import { Job } from "@/lib/jobs";
import { Interest, PickerProfile } from "@/lib/interests";

interface JobWithInterests extends Job {
  interests: Interest[];
}

/* ============================================================
   Icons
   ============================================================ */
interface IconProps { d: string | string[]; size?: number; sw?: number }
function Icon({ d, size = 16, sw = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const I = {
  chevD:  "m6 9 6 6 6-6",
  chevU:  "m18 15-6-6-6 6",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  close:  "M18 6 6 18M6 6l12 12",
  check:  "M20 6 9 17l-5-5",
  clock:  ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 7v5l3 2"],
  doc:    ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8"],
  rm:     "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
};

/* ============================================================
   Helpers
   ============================================================ */
function jobStateInfo(state: Job["state"]) {
  if (state === "urgent") return { label: "Urgent",  bg: "#F9DDB4", fg: "#7A4A0F", dot: "#E89020" };
  if (state === "taken")  return { label: "Taken",   bg: "#EDEAE2", fg: "#0F1F33", dot: "#6B7280" };
  return                         { label: "Open",    bg: "#FFFFFF", fg: "#0F1F33", dot: "#0F1F33" };
}

/* ============================================================
   Star score — compact amber rating
   ============================================================ */
function StarScore({ value, total }: { value: number | null; total: number }) {
  if (value === null) {
    return (
      <span style={{ fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>
        New kaki
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontVariantNumeric: "tabular-nums" }}>
      <Icon d={I.star} size={12} sw={0} />
      <span style={{ fontSize: 12, fontWeight: 700, color: "#0F1F33" }}>{value.toFixed(1)}</span>
      <span style={{ fontSize: 11, color: "#6B7280" }}>· {total} {total === 1 ? "job" : "jobs"}</span>
    </span>
  );
}

/* ============================================================
   Rating bar row — one dimension
   ============================================================ */
function RatingRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 11, color: "#6B7280", width: 110, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: "#E0DDD3", borderRadius: 999 }}>
        {value !== null && (
          <div style={{ width: `${(value / 5) * 100}%`, height: "100%", background: "#0F1F33", borderRadius: 999 }} />
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>
        {value !== null ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

/* ============================================================
   Picker profile modal
   ============================================================ */
function PickerProfileModal({
  picker,
  jobId,
  onClose,
  onConfirmed,
}: {
  picker: PickerProfile;
  jobId: string;
  onClose: () => void;
  onConfirmed: (pickerName: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone]             = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    try {
      await fetch("/api/jobs/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, pickerName: picker.name, pickerPhone: picker.phone }),
      });
      setDone(true);
      setTimeout(() => { onConfirmed(picker.name); onClose(); }, 1200);
    } catch {
      setConfirming(false);
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,31,51,0.4)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Card — stop propagation so clicks inside don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF", borderRadius: 20, width: "100%", maxWidth: 400,
          boxShadow: "0 24px 48px -12px rgba(15,31,51,0.28)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #E0DDD3", position: "relative" }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute", top: 16, right: 16,
              background: "transparent", border: "none", cursor: "pointer",
              color: "#6B7280", display: "flex", padding: 4,
            }}
          >
            <Icon d={I.close} size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            <div
              className="lk-avatar lk-avatar--lg"
              style={{ background: "#0F1F33", color: "#FAF7F2", flexShrink: 0 }}
            >
              {picker.initials}
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#0F1F33" }}>
                {picker.name}
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                {picker.firm}
              </div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{picker.firmState}</div>
            </div>
          </div>

          {/* Overall rating */}
          <div style={{ marginTop: 16 }}>
            <StarScore value={picker.avgRating} total={picker.totalJobs} />
          </div>
        </div>

        {/* Rating breakdown */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0DDD3" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Rating breakdown
          </div>
          {picker.avgRating === null ? (
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              Fewer than 3 completed jobs — rating will appear after their third assignment.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <RatingRow label="Punctuality"      value={picker.punctuality} />
              <RatingRow label="Professionalism"  value={picker.professionalism} />
              <RatingRow label="Completeness"     value={picker.completeness} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: "20px 24px" }}>
          {done ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 52, color: "#1F8A5B", fontWeight: 700 }}>
              <Icon d={I.check} size={18} sw={2.5} /> Confirmed
            </div>
          ) : (
            <button
              className="lk-btn lk-btn--accent lk-btn--lg"
              disabled={confirming}
              onClick={handleConfirm}
              style={{ width: "100%" }}
            >
              {confirming ? "Confirming…" : `Confirm ${picker.name.split(" ")[0]} for this job`}
            </button>
          )}
          <p style={{ fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            Both of you will get a WhatsApp with each other&apos;s contact.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Interest row — a single picker who expressed interest
   ============================================================ */
function InterestRow({
  interest,
  onViewProfile,
}: {
  interest: Interest;
  onViewProfile: (picker: PickerProfile) => void;
}) {
  const { picker } = interest;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px",
        background: "#FFFFFF",
        border: "1px solid #E0DDD3",
        borderRadius: 10,
      }}
    >
      <div
        className="lk-avatar lk-avatar--sm"
        style={{ background: "#0F1F33", color: "#FAF7F2", flexShrink: 0 }}
      >
        {picker.initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={() => onViewProfile(picker)}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: "inherit", textAlign: "left",
          }}
        >
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#0F1F33",
            textDecoration: "underline", textDecorationColor: "#E0DDD3",
            textUnderlineOffset: 3,
          }}>
            {picker.name}
          </span>
        </button>
        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {picker.firm} · {picker.firmState}
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        {/* Inline star score */}
        {picker.avgRating !== null ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="#E89020" stroke="none" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {picker.avgRating.toFixed(1)}
            </span>
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "#6B7280", fontStyle: "italic" }}>New</span>
        )}
        <span style={{ fontSize: 10, color: "#6B7280" }}>{interest.expressedAt}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Posted job card
   ============================================================ */
function PostedJobCard({
  job,
  interests,
  expanded,
  onToggle,
  onViewProfile,
}: {
  job: Job;
  interests: Interest[];
  expanded: boolean;
  onToggle: () => void;
  onViewProfile: (picker: PickerProfile, jobId: string) => void;
}) {
  const info         = jobStateInfo(job.state);
  const interestCount = interests.length;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E0DDD3",
        borderLeft: `3px solid ${info.dot}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Job summary row */}
      <button
        onClick={onToggle}
        style={{
          display: "flex", width: "100%", alignItems: "flex-start", gap: 10,
          padding: "12px 14px", background: "transparent", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* State badge */}
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 8px", borderRadius: 999,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.02em",
              background: info.bg, color: info.fg,
              border: `1px solid ${info.dot}`,
              marginBottom: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: info.dot }} />
            {info.label}
          </span>

          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", color: "#0F1F33", lineHeight: 1.3 }}>
            {job.venue}
          </div>

          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4, fontSize: 11, color: "#6B7280" }}>
            <Icon d={I.clock} size={11} sw={2} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{job.time} · {job.dateMeta}</span>
            <span>·</span>
            <Icon d={I.doc} size={11} sw={2} />
            <span>{job.docType}</span>
          </div>
        </div>

        {/* Right: fee + interest count + chevron */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#0F1F33" }}>
            RM {job.fee}
          </span>

          {job.state !== "taken" && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: interestCount > 0 ? "#E89020" : "#6B7280",
            }}>
              {interestCount > 0 ? `${interestCount} interested` : "No interest yet"}
            </span>
          )}
          {job.state === "taken" && job.takenBy && (
            <span style={{ fontSize: 11, color: "#6B7280" }}>
              Taken by {job.takenBy.name.split(" ")[0]}
            </span>
          )}

          <Icon d={expanded ? I.chevU : I.chevD} size={14} sw={2} />
        </div>
      </button>

      {/* Expanded: interest list */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #F0EDE5",
            padding: "10px 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "#FAF7F2",
          }}
        >
          {job.state === "taken" && job.takenBy ? (
            <div style={{ fontSize: 12, color: "#6B7280", padding: "4px 2px" }}>
              This job has been taken by <strong style={{ color: "#0F1F33" }}>{job.takenBy.name}</strong>.
            </div>
          ) : interestCount === 0 ? (
            <div style={{ fontSize: 12, color: "#6B7280", padding: "4px 2px" }}>
              No one has expressed interest yet. Check back soon.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 2px 4px" }}>
                Interested kakis
              </div>
              {interests.map((int) => (
                <InterestRow
                  key={int.id}
                  interest={int}
                  onViewProfile={(picker) => onViewProfile(picker, job.id)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MyJobs — main export
   ============================================================ */
export default function MyJobs({
  token = "",
  onConfirmed,
}: {
  token?:      string;
  onConfirmed: (pickerName: string) => void;
}) {
  const [jobs, setJobs]                 = useState<JobWithInterests[]>([]);
  const [loading, setLoading]           = useState(true);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [modalData, setModalData]       = useState<{ picker: PickerProfile; jobId: string } | null>(null);
  const [confirmedJobs, setConfirmedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/jobs/posted", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  function toggle(jobId: string) {
    setExpandedId((prev) => (prev === jobId ? null : jobId));
  }

  function handleConfirmed(pickerName: string, jobId: string) {
    setConfirmedJobs((prev) => new Set([...prev, jobId]));
    onConfirmed(pickerName);
  }

  const openCount  = jobs.filter((j) => j.state !== "taken" && !confirmedJobs.has(j.id)).length;
  const takenCount = jobs.filter((j) => j.state === "taken"  ||  confirmedJobs.has(j.id)).length;

  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: "14px 18px 10px",
          borderBottom: "1px solid #E0DDD3",
          background: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
          My posted jobs
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {openCount} open · {takenCount} taken
        </div>
      </div>

      {/* Job list */}
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
        {loading && (
          <div style={{ padding: 32, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
            Loading…
          </div>
        )}
        {!loading && jobs.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
            No posted jobs yet.
          </div>
        )}
        {jobs.map((job) => (
          <PostedJobCard
            key={job.id}
            job={confirmedJobs.has(job.id) ? { ...job, state: "taken" } : job}
            interests={job.interests}
            expanded={expandedId === job.id}
            onToggle={() => toggle(job.id)}
            onViewProfile={(picker, jobId) => setModalData({ picker, jobId })}
          />
        ))}
      </div>

      {/* Picker profile modal */}
      {modalData && (
        <PickerProfileModal
          picker={modalData.picker}
          jobId={modalData.jobId}
          onClose={() => setModalData(null)}
          onConfirmed={(name) => { handleConfirmed(name, modalData.jobId); setModalData(null); }}
        />
      )}
    </>
  );
}
