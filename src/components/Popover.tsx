"use client";

import { useEffect, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

/* ============================================================
   Popover — shared floating-panel primitive for anything
   triggered from a button: dropdowns, menus, notification
   panels. Renders with `position: fixed`, computed from the
   trigger's own getBoundingClientRect() and clamped to the
   viewport, so the panel can never be pushed off-screen —
   there is no separate "mobile" code path to remember, because
   the same viewport-clamping math is correct at every width.

   (A previous version of the notification bell used a hardcoded
   isMobile branch with a magic-number top offset; that only
   worked because someone happened to test it on a phone. This
   replaces every hand-rolled `position:absolute; right:0`
   dropdown in the app — see Dashboard.tsx, Settings.tsx,
   LoginFlow.tsx — with one component so the next popover gets
   this for free.)
   ============================================================ */

const EDGE = 12; // panel never sits closer than this to the viewport edge

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** Ref to the trigger element the panel is positioned against. */
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  /**
   * Horizontal alignment relative to the anchor:
   * "end" — panel's right edge matches the anchor's right edge (menus, notification bells)
   * "start" — panel's left edge matches the anchor's left edge
   * "stretch" — panel width matches the anchor's width exactly (form dropdowns/selects)
   */
  align?: "start" | "end" | "stretch";
  /** Preferred panel width. Ignored when align="stretch". Clamped to the viewport regardless. */
  width?: number;
  /** Max panel height, further clamped to fit the viewport. */
  maxHeight?: number;
  /** Space between the anchor and the panel. */
  gap?: number;
  panelStyle?: CSSProperties;
}

export default function Popover({
  open, onClose, anchorRef, children,
  align = "end", width = 320, maxHeight = 420, gap = 8, panelStyle,
}: PopoverProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!open) return;
    function update() {
      setRect(anchorRef.current?.getBoundingClientRect() ?? null);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !rect) return null;

  const panelWidth = align === "stretch" ? rect.width : Math.min(width, viewport.w - EDGE * 2);

  let left = align === "stretch" || align === "start" ? rect.left : rect.right - panelWidth;
  left = Math.max(EDGE, Math.min(left, viewport.w - panelWidth - EDGE));

  const spaceBelow = viewport.h - (rect.bottom + gap);
  const placeBelow = spaceBelow > 160 || rect.top < 160;
  const cappedMaxHeight = Math.min(maxHeight, viewport.h - EDGE * 2);

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 250 }} onClick={onClose} />
      <div
        style={{
          position: "fixed", left, width: panelWidth, zIndex: 251,
          ...(placeBelow ? { top: rect.bottom + gap } : { bottom: viewport.h - rect.top + gap }),
          maxHeight: cappedMaxHeight,
          background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 16,
          boxShadow: "0 24px 48px -12px rgba(15,31,51,0.28)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          ...panelStyle,
        }}
      >
        {children}
      </div>
    </>
  );
}
