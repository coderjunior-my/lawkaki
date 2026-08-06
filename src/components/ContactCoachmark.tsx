"use client";

import { useEffect, useState } from "react";

/* ============================================================
   ContactCoachmark — a single-step, first-time-only spotlight
   that points at the "Contact us" tab in Settings, letting
   people know they can reach the company from here. Shown once
   ever per browser (localStorage), mirroring CoachmarkTour.
   ============================================================ */

const STORAGE_KEY = "lk_contact_coachmark_seen";
const TARGET_ID = "lk-settings-contact-nav";

export default function ContactCoachmark({ active }: { active: boolean }) {
  const [dismissed, setDismissed] = useState(true);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (active) setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, [active]);

  const running = active && !dismissed;

  useEffect(() => {
    if (!running) return;

    function update() {
      const el = document.getElementById(TARGET_ID);
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
  }, [running]);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
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

  const CARD_W = 280;
  const spaceBelow = viewport.h - (hTop + hHeight);
  const placeBelow = spaceBelow > 160;
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

      {/* Transparent capture over the target — keeps it visible but not clickable mid-callout */}
      <div style={{ position: "fixed", top: hTop, left: hLeft, width: hWidth, height: hHeight, zIndex: 401 }} />

      {/* Amber ring */}
      <div
        style={{
          position: "fixed", top: hTop, left: hLeft, width: hWidth, height: hHeight,
          border: "2px solid var(--amber)", borderRadius: 16, zIndex: 401,
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
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 6, color: "var(--black)" }}>
          Need a hand?
        </div>
        <div style={{ fontSize: 13.5, color: "var(--warm-grey)", lineHeight: 1.5, marginBottom: 18 }}>
          You can reach the Law Kaki team here anytime — WhatsApp, call, or email.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={finish} className="lk-btn lk-btn--accent lk-btn--sm" style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}>
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
