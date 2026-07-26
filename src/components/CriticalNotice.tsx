"use client";

/* ============================================================
   CriticalNotice — a persistent, non-dismissible banner for a
   blocking account task (e.g. "add your bank details"). Unlike
   the notification inbox (dismissible, informational), this has
   no close button by design: it only goes away once the caller's
   underlying condition clears, so render it conditionally —
   `{!bankDetailsAdded && <CriticalNotice ... />}` — rather than
   giving it its own dismiss state.

   Soft-amber background + amber border, matching the existing
   "pending" status treatment (Settings.tsx PaymentBadge) rather
   than a full amber fill — stays legible if it sits on screen for
   days, and keeps to one amber signal rather than fighting the CTA
   for attention.
   ============================================================ */
export default function CriticalNotice({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 18px",
        background: "var(--amber-soft)",
        borderBottom: "1px solid var(--amber)",
        flexShrink: 0,
      }}
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#7A4A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden style={{ flexShrink: 0 }}
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#5C3A0D", lineHeight: 1.4 }}>
        {message}
      </span>

      <button
        onClick={onAction}
        className="lk-btn lk-btn--sm"
        style={{ flexShrink: 0, height: 30, padding: "0 14px", fontSize: 12.5 }}
      >
        {actionLabel}
      </button>
    </div>
  );
}
