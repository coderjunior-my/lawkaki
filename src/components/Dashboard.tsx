"use client";

import { useState, useMemo, useEffect, CSSProperties } from "react";
import { JOBS, Job } from "@/lib/jobs";

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
};

/* ============================================================
   Logo mark
   ============================================================ */
function LogoMark({ height = 38 }: { height?: number }) {
  const w = Math.round(height * 0.8);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {/* Pin SVG */}
      <svg width={w} height={height} viewBox="0 0 80 100" fill="none" aria-hidden>
        <path
          d="M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z"
          fill="#0F1F33"
        />
        {/* Footprint glyph */}
        <g fill="#FAF7F2" transform="translate(40 42) scale(0.34) translate(-30 -50)">
          <ellipse cx="30" cy="64" rx="18" ry="28" />
          <ellipse cx="14" cy="32" rx="4.4" ry="5.4" />
          <ellipse cx="23" cy="22" rx="4" ry="4.8" />
          <ellipse cx="32" cy="18" rx="3.6" ry="4.4" />
          <ellipse cx="41" cy="22" rx="3.2" ry="4" />
          <ellipse cx="48" cy="30" rx="2.8" ry="3.4" />
        </g>
      </svg>
      {/* Text */}
      <div>
        <div
          style={{
            fontSize: Math.round(height * 0.55),
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--black)",
            lineHeight: 1.1,
          }}
        >
          Law Kaki
        </div>
        <div
          style={{
            fontSize: Math.max(9, Math.round(height * 0.22)),
            fontWeight: 500,
            color: "var(--warm-grey)",
            letterSpacing: "-0.005em",
          }}
        >
          Your best legal kaki on the ground.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TopNav
   ============================================================ */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function TopNav({
  logoSize = 38,
  isMobile = false,
  onSignOut,
  userName = "",
}: {
  logoSize?: number;
  isMobile?: boolean;
  onSignOut?: () => void;
  userName?: string;
}) {
  const navH = Math.max(60, logoSize + 28);
  return (
    <header
      style={{
        height: navH,
        background: "#FFFFFF",
        borderBottom: "1px solid var(--hair)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 24,
        flexShrink: 0,
      }}
    >
      <LogoMark height={logoSize} />

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 420, marginLeft: 16, position: "relative", display: isMobile ? "none" : undefined }}>
        <span
          style={{
            position: "absolute",
            left: 12,
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
          placeholder="Search by venue, document, or case no."
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 36,
            paddingRight: 14,
            background: "var(--off-white)",
            border: "1px solid transparent",
            borderRadius: 999,
            fontSize: 13,
            color: "var(--black)",
            fontFamily: "inherit",
            fontWeight: 500,
            outline: "none",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Bell */}
      <button style={iconBtnStyle} aria-label="Notifications">
        <Icon d={I.bell} size={20} />
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            background: "var(--amber)",
            borderRadius: 999,
            border: "2px solid #FFFFFF",
          }}
        />
      </button>

      {/* User avatar */}
      {userName && (
        <div
          className="lk-avatar lk-avatar--sm"
          style={{ background: "var(--black)", color: "var(--off-white)", flexShrink: 0 }}
          title={userName}
        >
          {getInitials(userName)}
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        style={{
          ...iconBtnStyle,
          ...(isMobile ? {} : {
            width: "auto",
            padding: "0 14px",
            gap: 7,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            color: "var(--warm-grey)",
          }),
        }}
        aria-label="Sign out"
      >
        <Icon d={I.logout} size={16} />
        {!isMobile && <span>Sign out</span>}
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

function FilterBar({
  filters,
  setFilters,
  count,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  count: number;
}) {
  return (
    <div
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
   Dashboard — main export
   ============================================================ */
export default function Dashboard({ onSignOut, userName = "" }: { onSignOut?: () => void; userName?: string }) {
  const [filters, setFilters] = useState<Filters>({
    date: "This week",
    docType: "All",
    minFee: 50,
  });
  const [selectedId, setSelected] = useState<string | null>("lk-2026-0418");
  const [hoveredId, setHovered] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filtered = useMemo(
    () =>
      JOBS.filter((j) => {
        if (
          filters.docType !== "All" &&
          !j.docType.toLowerCase().includes(filters.docType.toLowerCase().split(" ")[0])
        )
          return false;
        if (j.fee < filters.minFee) return false;
        return true;
      }),
    [filters]
  );

  const onAccept = (j: Job) =>
    setToast(
      `Interest sent. ${j.poster.name} will see your profile in their shortlist and confirm via WhatsApp.`
    );
  const onPost = () => setToast("Opens the post-a-job sheet.");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--off-white)",
      }}
    >
      <TopNav isMobile={isMobile} onSignOut={onSignOut} userName={userName} />

      <main style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: isMobile ? "column" : "row" }}>
        {/* Left panel */}
        <aside
          style={{
            width: isMobile ? "100%" : (panelOpen ? 380 : 0),
            flexShrink: 0,
            background: "var(--off-white)",
            borderRight: isMobile ? "none" : "1px solid var(--hair)",
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
          {(isMobile || panelOpen) && (
            <>
              <FilterBar filters={filters} setFilters={setFilters} count={filtered.length} />
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
                    No jobs match these filters.
                    <br />
                    Try widening your fee range or date.
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Collapse handle — desktop only */}
        {!isMobile && (
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

        {/* Map */}
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
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
