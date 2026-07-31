"use client";

import { useEffect, useState } from "react";

/* ============================================================
   CoachmarkTour — a short, first-run-only spotlight walkthrough
   of the dashboard's key actions. Points at real DOM elements
   (matched by id, set on the target components) rather than
   duplicating markup, so it always tracks the live layout.
   Shown once ever per browser (localStorage), on the browse view.
   ============================================================ */

const STORAGE_KEY = "lk_coachmark_seen";

interface CoachStep {
  targetId: string;
  title: string;
  body: string;
  radius: number;
}

const STEPS: CoachStep[] = [
  {
    targetId: "lk-coach-post",
    title: "Post a job",
    body: "Can't make a signing? Post it here — venue, time, and fee, in under a minute.",
    radius: 999,
  },
  {
    targetId: "lk-coach-filters",
    title: "Filter what you see",
    body: "Narrow jobs down by date, document type, or minimum fee.",
    radius: 16,
  },
  {
    targetId: "lk-coach-tasks",
    title: "Track what needs you",
    body: "Confirmations, jobs in progress, and reviews you owe — all in one place.",
    radius: 999,
  },
  {
    targetId: "lk-coach-bell",
    title: "Stay in the loop",
    body: "Get notified the moment a job needs your attention.",
    radius: 999,
  },
  {
    targetId: "lk-coach-settings",
    title: "Your profile",
    body: "Manage your details and see your job history here.",
    radius: 999,
  },
];

const CHEV_R = "m9 18 6-6-6-6";

export default function CoachmarkTour({ active }: { active: boolean }) {
  const [dismissed, setDismissed] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (active) setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, [active]);

  const running = active && !dismissed;
  const step = STEPS[stepIndex];

  useEffect(() => {
    if (!running) return;

    function update() {
      const el = document.getElementById(step.targetId);
      setRect(el ? el.getBoundingClientRect() : null);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [running, step]);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    else finish();
  }

  useEffect(() => {
    if (!running) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  if (!running || !rect) return null;

  const PAD = 8;
  const hTop    = rect.top - PAD;
  const hLeft   = rect.left - PAD;
  const hWidth  = rect.width + PAD * 2;
  const hHeight = rect.height + PAD * 2;

  const CARD_W = 300;
  const spaceBelow = viewport.h - (hTop + hHeight);
  const placeBelow = spaceBelow > 190 || hTop < 190;
  let cardLeft = hLeft + hWidth / 2 - CARD_W / 2;
  cardLeft = Math.max(12, Math.min(cardLeft, viewport.w - CARD_W - 12));

  const dim: React.CSSProperties = { position: "fixed", background: "rgba(15,31,51,0.55)", zIndex: 400 };

  return (
    <>
      {/* Four dimming panels frame the spotlight hole */}
      <div style={{ ...dim, top: 0, left: 0, right: 0, height: Math.max(hTop, 0) }} />
      <div style={{ ...dim, top: hTop + hHeight, left: 0, right: 0, bottom: 0 }} />
      <div style={{ ...dim, top: hTop, left: 0, width: Math.max(hLeft, 0), height: hHeight }} />
      <div style={{ ...dim, top: hTop, left: hLeft + hWidth, right: 0, height: hHeight }} />

      {/* Transparent capture over the target — keeps it visible but not clickable mid-tour */}
      <div style={{ position: "fixed", top: hTop, left: hLeft, width: hWidth, height: hHeight, zIndex: 401 }} />

      {/* Amber ring */}
      <div
        style={{
          position: "fixed", top: hTop, left: hLeft, width: hWidth, height: hHeight,
          border: "2px solid var(--amber)", borderRadius: step.radius, zIndex: 401,
          boxShadow: "0 0 0 4px rgba(232,144,32,0.18)",
        }}
      />

      {/* Tooltip card */}
      <div
        style={{
          position: "fixed", left: cardLeft, width: CARD_W, zIndex: 402,
          ...(placeBelow ? { top: hTop + hHeight + 14 } : { top: Math.max(hTop - 14, 12), transform: "translateY(-100%)" }),
          background: "#FFFFFF", borderRadius: 16, padding: "18px 20px",
          boxShadow: "0 24px 48px -12px rgba(15,31,51,0.32)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-grey)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          {stepIndex + 1} of {STEPS.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 6, color: "var(--black)" }}>
          {step.title}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--warm-grey)", lineHeight: 1.5, marginBottom: 18 }}>
          {step.body}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <button
            onClick={finish}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "var(--warm-grey)", padding: 0 }}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === stepIndex ? 16 : 6, height: 6, borderRadius: 999,
                  background: i === stepIndex ? "var(--amber)" : "var(--hair)",
                  transition: "width 180ms var(--ease, ease)",
                }}
              />
            ))}
          </div>
          <button onClick={next} className="lk-btn lk-btn--accent lk-btn--sm" style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}>
            {stepIndex < STEPS.length - 1 ? "Next" : "Got it"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={CHEV_R} />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
