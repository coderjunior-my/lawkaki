"use client";

import { useState, useEffect, CSSProperties } from "react";

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
  chevL:  "m15 18-6-6 6-6",
  chevR:  "m9 18 6-6-6-6",
  check:  "M20 6 9 17l-5-5",
  close:  "M18 6 6 18M6 6l12 12",
  user:   ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  bell:   "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  cal:    "M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  info:   ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 8v4", "M12 16h.01"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  pencil: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
};

/* ============================================================
   Types
   ============================================================ */
type SettingsModule = "hub" | "profile" | "notifications" | "availability" | "about";

interface NotifPrefs {
  newJobAlerts:      boolean;
  twoHourReminder:   boolean;
  thirtyMinReminder: boolean;
  interestAlerts:    boolean;
  confirmAlerts:     boolean;
}

interface AvailPrefs {
  days:      boolean[]; // index 0 = Monday, 6 = Sunday
  startHour: number;
  endHour:   number;
}

const DEFAULT_NOTIF: NotifPrefs = {
  newJobAlerts:      true,
  twoHourReminder:   true,
  thirtyMinReminder: true,
  interestAlerts:    true,
  confirmAlerts:     true,
};

const DEFAULT_AVAIL: AvailPrefs = {
  days:      [true, true, true, true, true, false, false],
  startHour: 9,
  endHour:   19,
};

/* ============================================================
   Helpers
   ============================================================ */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:00 ${period}`;
}

/* ============================================================
   Toggle switch
   ============================================================ */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 999,
        background: on ? "var(--black)" : "var(--hair)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 140ms var(--ease)", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: 999, background: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(15,31,51,0.2)",
        transition: "left 140ms var(--ease)",
        display: "block",
      }} />
    </button>
  );
}

/* ============================================================
   Shared divider
   ============================================================ */
function Divider() {
  return <div style={{ height: 1, background: "var(--hair)" }} />;
}

/* ============================================================
   Sub-page header
   ============================================================ */
function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      padding: "14px 18px 12px",
      borderBottom: "1px solid var(--hair)",
      background: "#FFFFFF", flexShrink: 0,
    }}>
      <button
        onClick={onBack}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: "var(--black)", display: "flex", padding: "4px 8px 4px 0",
        }}
        aria-label="Back"
      >
        <Icon d={I.chevL} size={20} sw={2.2} />
      </button>
      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</span>
    </div>
  );
}

/* ============================================================
   Profile sub-page
   ============================================================ */
function ProfilePage({
  userName, userPhone, onBack, onChange,
}: {
  userName: string; userPhone: string;
  onBack: () => void; onChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(userName);
  const [saved, setSaved]     = useState(false);

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <>
      <SubPageHeader title="My profile" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 18px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingBottom: 4 }}>
          <div
            className="lk-avatar"
            style={{ width: 72, height: 72, fontSize: 24, background: "var(--black)", color: "var(--off-white)" }}
          >
            {getInitials(userName || "?")}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--black)" }}>
            {userName || "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--warm-grey)" }}>Conveyancing Lawyer</div>
        </div>

        {/* Fields */}
        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>

          {/* Display name */}
          <div style={{ padding: "14px 16px" }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: "var(--warm-grey)",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
            }}>
              Display name
            </div>
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  className="lk-input"
                  style={{ flex: 1, height: 40, fontSize: 14 }}
                  placeholder="Your name"
                />
                <button className="lk-btn lk-btn--sm" onClick={save} style={{ height: 40, flexShrink: 0 }}>
                  Save
                </button>
                <button
                  className="lk-btn lk-btn--ghost lk-btn--sm"
                  onClick={() => { setDraft(userName); setEditing(false); }}
                  style={{ height: 40, flexShrink: 0 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--black)" }}>
                  {userName || "—"}
                </span>
                <button
                  className="lk-btn lk-btn--ghost lk-btn--sm"
                  onClick={() => { setDraft(userName); setEditing(true); }}
                  style={{ height: 30, gap: 5 }}
                >
                  <Icon d={I.pencil} size={13} /> Edit
                </button>
              </div>
            )}
          </div>

          <Divider />

          {/* Phone (read-only) */}
          <div style={{ padding: "14px 16px" }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: "var(--warm-grey)",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
            }}>
              WhatsApp number
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--black)", fontVariantNumeric: "tabular-nums" }}>
                {userPhone || "+60 — —"}
              </span>
              <span style={{
                fontSize: 11, color: "var(--warm-grey)",
                background: "var(--pale-grey)", borderRadius: 6, padding: "3px 8px",
              }}>
                Cannot change
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--warm-grey)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Linked to your account. Contact the managing partner to update it.
            </p>
          </div>
        </div>

        {saved && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#1F8A5B", fontWeight: 600,
          }}>
            <Icon d={I.check} size={16} sw={2.5} /> Name updated.
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================================
   Notifications sub-page
   ============================================================ */
function NotificationsPage({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lk_notif_prefs");
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  function update(key: keyof NotifPrefs, val: boolean) {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    localStorage.setItem("lk_notif_prefs", JSON.stringify(next));
  }

  const rows: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: "newJobAlerts",      label: "New job alerts",          desc: "Get notified when jobs appear near your usual area." },
    { key: "twoHourReminder",   label: "2-hour reminder",         desc: "A WhatsApp reminder 2 hours before each confirmed appointment." },
    { key: "thirtyMinReminder", label: "30-minute reminder",      desc: "A final reminder 30 minutes before the appointment." },
    { key: "interestAlerts",    label: "Interest notifications",  desc: "Notify me when someone expresses interest in my posted job." },
    { key: "confirmAlerts",     label: "Confirmation alerts",     desc: "Notify me when a poster confirms me for a job." },
  ];

  return (
    <>
      <SubPageHeader title="Notifications" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 13, color: "var(--warm-grey)", margin: 0, lineHeight: 1.6 }}>
          All notifications are sent via WhatsApp. Adjust what you receive below.
        </p>

        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
          {rows.map((row, i) => (
            <div key={row.key}>
              {i > 0 && <Divider />}
              <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--black)" }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 3, lineHeight: 1.5 }}>{row.desc}</div>
                </div>
                <Toggle on={prefs[row.key]} onChange={(v) => update(row.key, v)} />
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "var(--warm-grey)", margin: 0, lineHeight: 1.6 }}>
          Changes take effect immediately. Critical firm-wide messages from the managing partner are always delivered.
        </p>
      </div>
    </>
  );
}

/* ============================================================
   Availability sub-page
   ============================================================ */
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AvailabilityPage({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState<AvailPrefs>(DEFAULT_AVAIL);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lk_avail_prefs");
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  function toggleDay(idx: number) {
    const next = [...prefs.days];
    next[idx] = !next[idx];
    setPrefs({ ...prefs, days: next });
  }

  function savePrefs() {
    localStorage.setItem("lk_avail_prefs", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <>
      <SubPageHeader title="Availability" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={{ fontSize: 13, color: "var(--warm-grey)", margin: 0, lineHeight: 1.6 }}>
          Jobs outside your availability window won&apos;t show up in your browse feed.
        </p>

        {/* Days */}
        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, padding: 16 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: "var(--warm-grey)",
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
          }}>
            Available days
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DAY_LABELS.map((day, idx) => (
              <button
                key={day}
                onClick={() => toggleDay(idx)}
                style={{
                  padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                  border: `1.5px solid ${prefs.days[idx] ? "var(--black)" : "var(--hair)"}`,
                  background: prefs.days[idx] ? "var(--black)" : "#FFFFFF",
                  color: prefs.days[idx] ? "var(--off-white)" : "var(--warm-grey)",
                  fontSize: 13, fontWeight: 600,
                  transition: "all 140ms var(--ease)",
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Time window */}
        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, padding: 16 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: "var(--warm-grey)",
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18,
          }}>
            Available hours
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>From</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--black)" }}>
                  {formatHour(prefs.startHour)}
                </span>
              </div>
              <input
                type="range" min={6} max={14} step={1}
                value={prefs.startHour}
                onChange={(e) =>
                  setPrefs({ ...prefs, startHour: Math.min(Number(e.target.value), prefs.endHour - 2) })
                }
                style={{ width: "100%", accentColor: "var(--black)" } as CSSProperties}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>Until</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--black)" }}>
                  {formatHour(prefs.endHour)}
                </span>
              </div>
              <input
                type="range" min={14} max={22} step={1}
                value={prefs.endHour}
                onChange={(e) =>
                  setPrefs({ ...prefs, endHour: Math.max(Number(e.target.value), prefs.startHour + 2) })
                }
                style={{ width: "100%", accentColor: "var(--black)" } as CSSProperties}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 14, marginBottom: 0, lineHeight: 1.5 }}>
            Window: {formatHour(prefs.startHour)} – {formatHour(prefs.endHour)}
          </p>
        </div>

        <button
          className="lk-btn"
          onClick={savePrefs}
          style={{ height: 48 }}
        >
          {saved ? (
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Icon d={I.check} size={16} sw={2.5} /> Saved
            </span>
          ) : "Save availability"}
        </button>
      </div>
    </>
  );
}

/* ============================================================
   About & help sub-page
   ============================================================ */
function AboutPage({ onBack, onSignOut }: { onBack: () => void; onSignOut?: () => void }) {
  return (
    <>
      <SubPageHeader title="About & help" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* App info */}
        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
          {[
            { label: "App",     value: "Law Kaki" },
            { label: "Phase",   value: "1 — Internal Pilot" },
            { label: "Version", value: "1.0.0" },
            { label: "Region",  value: "Kuala Lumpur & Selangor" },
          ].map((row, i) => (
            <div key={row.label}>
              {i > 0 && <Divider />}
              <div style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "var(--warm-grey)", fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--black)" }}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
          {[
            { label: "Terms of Service",       href: "#" },
            { label: "Privacy Policy (PDPA)",  href: "#" },
            { label: "Contact ops team",       href: "#" },
          ].map((row, i) => (
            <div key={row.label}>
              {i > 0 && <Divider />}
              <a
                href={row.href}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", textDecoration: "none", color: "var(--black)",
                  transition: "background 120ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--off-white)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>{row.label}</span>
                <Icon d={I.chevR} size={16} style={{ color: "var(--warm-grey)" }} />
              </a>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button
          className="lk-btn lk-btn--secondary"
          onClick={onSignOut}
          style={{ height: 48, color: "#B91C1C", borderColor: "#F4D3D3", gap: 8 }}
        >
          <Icon d={I.logout} size={16} />
          Sign out
        </button>

        <p style={{ fontSize: 12, color: "var(--warm-grey)", textAlign: "center", lineHeight: 1.7, margin: 0 }}>
          Law Kaki is for use within the firm only.<br />
          Reach out to the ops team with any questions.
        </p>
      </div>
    </>
  );
}

/* ============================================================
   Settings hub
   ============================================================ */
interface ModuleRow {
  key:   SettingsModule;
  icon:  string | string[];
  label: string;
  desc:  string;
}

const MODULES: ModuleRow[] = [
  {
    key:   "profile",
    icon:  ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
    label: "My profile",
    desc:  "Display name and WhatsApp number",
  },
  {
    key:   "notifications",
    icon:  "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
    label: "Notifications",
    desc:  "Reminders, job alerts, confirmations",
  },
  {
    key:   "availability",
    icon:  "M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    label: "Availability",
    desc:  "Days and hours you're open to pick up jobs",
  },
  {
    key:   "about",
    icon:  ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 8v4", "M12 16h.01"],
    label: "About & help",
    desc:  "App version, terms, and support",
  },
];

function SettingsHub({
  userName, onSelect, onClose,
}: {
  userName: string; onSelect: (m: SettingsModule) => void; onClose?: () => void;
}) {
  return (
    <>
      <div style={{
        padding: "14px 18px 10px", borderBottom: "1px solid var(--hair)",
        background: "#FFFFFF", flexShrink: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Settings</div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--warm-grey)", padding: 4, display: "flex" }}
            aria-label="Close settings"
          >
            <Icon d={I.close} size={18} />
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* User context card */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, padding: 16,
        }}>
          <div
            className="lk-avatar"
            style={{ background: "var(--black)", color: "var(--off-white)", flexShrink: 0 }}
          >
            {getInitials(userName || "?")}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--black)" }}>{userName || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 2 }}>
              Conveyancing Lawyer · Phase 1 Pilot
            </div>
          </div>
        </div>

        {/* Module list */}
        <div style={{ background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden" }}>
          {MODULES.map((m, i) => (
            <div key={m.key}>
              {i > 0 && <Divider />}
              <button
                onClick={() => onSelect(m.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%",
                  padding: "14px 16px", background: "transparent", border: "none",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: "background 120ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--off-white)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: "var(--pale-grey)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon d={m.icon} size={18} style={{ color: "var(--black)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--black)" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "var(--warm-grey)", marginTop: 1 }}>{m.desc}</div>
                </div>
                <Icon d={I.chevR} size={16} style={{ color: "var(--warm-grey)", flexShrink: 0 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Settings — main export
   ============================================================ */
export default function Settings({
  userName    = "",
  userPhone   = "",
  onSignOut,
  onNameChange,
  onClose,
}: {
  userName?:    string;
  userPhone?:   string;
  onSignOut?:   () => void;
  onNameChange?: (name: string) => void;
  onClose?:     () => void;
}) {
  const [module, setModule] = useState<SettingsModule>("hub");

  function back() { setModule("hub"); }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {module === "hub"           && <SettingsHub userName={userName} onSelect={setModule} onClose={onClose} />}
      {module === "profile"       && (
        <ProfilePage
          userName={userName} userPhone={userPhone}
          onBack={back} onChange={(n) => onNameChange?.(n)}
        />
      )}
      {module === "notifications" && <NotificationsPage onBack={back} />}
      {module === "availability"  && <AvailabilityPage onBack={back} />}
      {module === "about"         && <AboutPage onBack={back} onSignOut={onSignOut} />}
    </div>
  );
}
