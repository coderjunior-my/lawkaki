"use client";

import { CSSProperties } from "react";
import { PickedJob, getTodayISO } from "@/lib/pickedJobs";

function ReminderRow({
  label,
  detail,
  action,
  onAction,
}: {
  label: string;
  detail?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "13px 0",
        borderTop: "1px solid var(--pale-grey)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--black)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
          {label}
        </div>
        {detail && (
          <div style={{ fontSize: 11, color: "var(--warm-grey)", marginTop: 3, lineHeight: 1.5 }}>
            {detail}
          </div>
        )}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--black)",
            padding: 0,
            whiteSpace: "nowrap",
            flexShrink: 0,
            letterSpacing: "-0.005em",
          } as CSSProperties}
        >
          {action} →
        </button>
      )}
    </div>
  );
}

export default function ReminderPopup({
  onDismiss,
  onNavigate,
  pickedJobs = [],
}: {
  onDismiss:   () => void;
  onNavigate:  (view: "browse" | "my-jobs" | "picked") => void;
  pickedJobs?: PickedJob[];
}) {
  const todayISO   = getTodayISO();
  const todayJobs  = pickedJobs
    .filter((j) => j.dateISO === todayISO && j.status !== "awaiting")
    .sort((a, b) => a.time.localeCompare(b.time));
  const unpaidJobs = pickedJobs.filter(
    (j) => j.status === "completed" && j.paymentStatus === "unpaid",
  );
  const totalUnpaid = unpaidJobs.reduce((s, j) => s + j.fee, 0);

  if (todayJobs.length === 0 && unpaidJobs.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,31,51,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          borderRadius: 20,
          padding: "28px 28px 24px",
          boxShadow: "0 24px 60px -12px rgba(15,31,51,0.32)",
          position: "relative",
        }}
      >
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--warm-grey)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div style={{ marginBottom: 4 }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--warm-grey)" }}>
            Quick catch-up
          </p>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--black)", lineHeight: 1.2 }}>
            Here&apos;s where things stand.
          </h2>
        </div>

        <div style={{ marginTop: 4 }}>
          {todayJobs.length > 0 && (
            <ReminderRow
              label={`${todayJobs.length} appointment${todayJobs.length !== 1 ? "s" : ""} on your plate today`}
              detail={todayJobs.map((j) => `${j.venue} · ${j.time}`).join("\n")}
              action="View schedule"
              onAction={() => onNavigate("picked")}
            />
          )}
          {unpaidJobs.length > 0 && (
            <ReminderRow
              label={`RM ${totalUnpaid} outstanding`}
              detail={unpaidJobs.map((j) => `${j.venue} · ${j.dateLabel}`).join("\n")}
              action="Follow up"
              onAction={() => onNavigate("picked")}
            />
          )}
        </div>

        <button
          onClick={onDismiss}
          className="lk-btn"
          style={{ width: "100%", height: 44, marginTop: 20 }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
