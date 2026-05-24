"use client";

import {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import { LAW_FIRMS, LawFirmOption } from "@/lib/lawFirms";
import type { UserRole } from "@/lib/types";

/* ============================================================
   Icons — Lucide-style inline SVGs
   ============================================================ */
interface IconProps {
  d: string | string[];
  size?: number;
  sw?: number;
  style?: CSSProperties;
}
function Icon({ d, size = 20, sw = 2, style }: IconProps) {
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
      style={style}
      aria-hidden
    >
      {Array.isArray(d)
        ? d.map((p, i) => <path key={i} d={p} />)
        : <path d={d} />}
    </svg>
  );
}

const I = {
  arrowR:     "M5 12h14M12 5l7 7-7 7",
  chevL:      "m15 18-6-6 6-6",
  check:      "M20 6 9 17l-5-5",
  briefcase:  ["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z", "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"],
  mapPin:     ["M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z", "M12 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"],
  repeat:     ["M17 1l4 4-4 4", "M3 11V9a4 4 0 0 1 4-4h14", "M7 23l-4-4 4-4", "M21 13v2a4 4 0 0 1-4 4H3"],
};

/* ============================================================
   Logo mark (identical to Dashboard)
   ============================================================ */
function LogoMark({ height = 32 }: { height?: number }) {
  const w = Math.round(height * 0.8);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={w} height={height} viewBox="0 0 80 100" fill="none" aria-hidden>
        <path
          d="M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z"
          fill="#0F1F33"
        />
        <g fill="#FAF7F2" transform="translate(40 42) scale(0.34) translate(-30 -50)">
          <ellipse cx="30" cy="64" rx="18" ry="28" />
          <ellipse cx="14" cy="32" rx="4.4" ry="5.4" />
          <ellipse cx="23" cy="22" rx="4" ry="4.8" />
          <ellipse cx="32" cy="18" rx="3.6" ry="4.4" />
          <ellipse cx="41" cy="22" rx="3.2" ry="4" />
          <ellipse cx="48" cy="30" rx="2.8" ry="3.4" />
        </g>
      </svg>
      <div>
        <div style={{ fontSize: Math.round(height * 0.6), fontWeight: 700, letterSpacing: "-0.02em", color: "#0F1F33", lineHeight: 1.1 }}>
          Law Kaki
        </div>
        <div style={{ fontSize: Math.max(9, Math.round(height * 0.25)), fontWeight: 500, color: "#6B7280", letterSpacing: "-0.005em" }}>
          Your best legal kaki on the ground.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Step progress dots
   ============================================================ */
function StepDots({ activeIndex }: { activeIndex: 0 | 1 | 2 }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {([0, 1, 2] as const).map((i) => (
        <div
          key={i}
          style={{
            width: i === activeIndex ? 20 : 6,
            height: 6,
            borderRadius: 999,
            background: i === activeIndex ? "#0F1F33" : i < activeIndex ? "#6B7280" : "#E0DDD3",
            transition: "width 220ms cubic-bezier(0.2,0.6,0.2,1), background 220ms cubic-bezier(0.2,0.6,0.2,1)",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Shared style tokens
   ============================================================ */
const S: Record<string, CSSProperties> = {
  headline: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.025em",
    color: "#0F1F33",
    lineHeight: 1.2,
  },
  body: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 1.55,
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 11,
    fontWeight: 700,
    color: "#6B7280",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  error: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#B91C1C",
    lineHeight: 1.4,
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#6B7280",
    padding: 0,
    fontFamily: "inherit",
    justifyContent: "center",
    width: "100%",
  },
};

function otpBoxStyle(hasError: boolean, filled: boolean): CSSProperties {
  return {
    width: 44,
    height: 52,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    border: `1.5px solid ${hasError ? "#B91C1C" : filled ? "#0F1F33" : "#E0DDD3"}`,
    borderRadius: 12,
    background: "#FFFFFF",
    color: "#0F1F33",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 140ms cubic-bezier(0.2,0.6,0.2,1)",
    caretColor: "transparent",
  };
}

/* ============================================================
   Helpers
   ============================================================ */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("60")) return `+${digits}`;
  if (digits.startsWith("0"))  return `+60${digits.slice(1)}`;
  return `+60${digits}`;
}

function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 5) return phone;
  // +601X XXXX XXXX  (vary: 10 or 11 digits after +)
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`.trim();
}

function isValidMYPhone(phone: string): boolean {
  return /^\+601\d{7,9}$/.test(phone);
}

/* ============================================================
   Step 1 — Phone number
   ============================================================ */
function PhoneStep({ onNext }: { onNext: (phone: string) => void }) {
  const [value, setValue]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoad]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = normalizePhone(value);
    if (!isValidMYPhone(phone)) {
      setError("Enter a valid Malaysian mobile number, e.g. 012-3456789.");
      return;
    }
    setError("");
    setLoad(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      onNext(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoad(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={S.headline}>Let&apos;s get you in.</h1>
        <p style={S.body}>Enter the mobile number linked to your WhatsApp.</p>
      </div>

      <div>
        <label htmlFor="lk-phone" style={S.label}>Mobile number</label>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              background: "#F0EDE5",
              border: "1.5px solid #E0DDD3",
              borderRight: "none",
              borderRadius: "12px 0 0 12px",
              fontSize: 15,
              fontWeight: 600,
              color: "#0F1F33",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            +60
          </div>
          <input
            id="lk-phone"
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            placeholder="12-3456789"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            style={{
              flex: 1,
              height: 48,
              background: "#FFFFFF",
              border: "1.5px solid #E0DDD3",
              borderRadius: "0 12px 12px 0",
              padding: "0 16px",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 500,
              color: "#0F1F33",
              outline: "none",
            }}
            aria-describedby={error ? "phone-error" : undefined}
          />
        </div>
        {error && (
          <p id="phone-error" style={S.error}>{error}</p>
        )}
      </div>

      <button
        type="submit"
        className="lk-btn lk-btn--accent lk-btn--lg"
        disabled={loading || !value.trim()}
        style={{ width: "100%" }}
      >
        {loading ? "Sending code…" : <><span>Send code</span> <Icon d={I.arrowR} size={16} /></>}
      </button>

      <p style={{ fontSize: 11, color: "#6B7280", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
        We&apos;ll send a 6-digit code via WhatsApp.
      </p>
    </form>
  );
}

/* ============================================================
   Step 2 — OTP verification
   ============================================================ */
const OTP_LEN      = 6;
const RESEND_SECS  = 60;

function OtpStep({
  phone,
  onNext,
  onBack,
}: {
  phone: string;
  onNext: (sessionToken: string) => void;
  onBack: () => void;
}) {
  const [digits, setDigits]     = useState<string[]>(Array(OTP_LEN).fill(""));
  const [error, setError]       = useState("");
  const [loading, setLoad]      = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [resending, setResend]  = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LEN).fill(null));

  useEffect(() => { refs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const code = digits.join("");

  function setDigit(index: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError("");
    if (char && index < OTP_LEN - 1) refs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && index > 0)          { e.preventDefault(); refs.current[index - 1]?.focus(); }
    if (e.key === "ArrowRight" && index < OTP_LEN - 1) { e.preventDefault(); refs.current[index + 1]?.focus(); }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    const next = Array(OTP_LEN).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    setError("");
    refs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < OTP_LEN) { setError("Enter the full 6-digit code."); return; }
    setError("");
    setLoad(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That code didn't work.");
      onNext(data.sessionToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Try again.");
      setDigits(Array(OTP_LEN).fill(""));
      refs.current[0]?.focus();
    } finally {
      setLoad(false);
    }
  }

  async function handleResend() {
    setResend(true);
    setError("");
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      setCountdown(RESEND_SECS);
      setDigits(Array(OTP_LEN).fill(""));
      refs.current[0]?.focus();
    } finally {
      setResend(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={S.headline}>Check your WhatsApp.</h1>
        <p style={S.body}>
          We sent a 6-digit code to{" "}
          <span style={{ fontWeight: 700, color: "#0F1F33" }}>{formatPhoneDisplay(phone)}</span>.
        </p>
      </div>

      {/* OTP boxes */}
      <div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              style={otpBoxStyle(!!error, !!d)}
              aria-label={`Digit ${i + 1} of ${OTP_LEN}`}
            />
          ))}
        </div>
        {error && (
          <p style={{ ...S.error, textAlign: "center", marginTop: 10 }}>{error}</p>
        )}
      </div>

      {/* Resend */}
      <div style={{ textAlign: "center", fontSize: 13 }}>
        {countdown > 0 ? (
          <span style={{ color: "#6B7280" }}>Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{ ...S.ghostBtn, width: "auto", color: "#0F1F33", fontWeight: 600 }}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>

      <button
        type="submit"
        className="lk-btn lk-btn--accent lk-btn--lg"
        disabled={loading || code.length < OTP_LEN}
        style={{ width: "100%" }}
      >
        {loading ? "Verifying…" : "Verify →"}
      </button>

      <button type="button" onClick={onBack} style={S.ghostBtn}>
        <Icon d={I.chevL} size={14} /> Change number
      </button>
    </form>
  );
}

/* ============================================================
   Step 3 — Firm + Role
   ============================================================ */
const ROLES: {
  value: UserRole;
  title: string;
  desc: string;
  icon: string | string[];
}[] = [
  {
    value: "poster",
    title: "Post jobs",
    desc: "I have appointments I want to delegate",
    icon: I.briefcase,
  },
  {
    value: "picker",
    title: "Pick up jobs",
    desc: "I'm available to cover for colleagues",
    icon: I.mapPin,
  },
  {
    value: "both",
    title: "Both",
    desc: "I'll post and pick as needed",
    icon: I.repeat,
  },
];

function ProfileStep({
  sessionToken,
  onNext,
}: {
  sessionToken: string;
  onNext: (role: UserRole, appToken: string, userName: string) => void;
}) {
  const [name, setName]             = useState("");
  const [query, setQuery]           = useState("");
  const [firm, setFirm]             = useState<LawFirmOption | null>(null);
  const [open, setOpen]             = useState(false);
  const [role, setRole]             = useState<UserRole | null>(null);
  const [error, setError]           = useState("");
  const [loading, setLoad]          = useState(false);

  const matches = LAW_FIRMS.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Enter your full name as it appears on your MyKad."); return; }
    if (!firm) { setError("Select your firm to continue."); return; }
    if (!role) { setError("Tell us how you'll use Law Kaki."); return; }
    setError("");
    setLoad(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, name: name.trim(), firmId: firm.id, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      onNext(role, data.token, name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoad(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={S.headline}>One more thing.</h1>
        <p style={S.body}>Tell us your firm and how you&apos;ll be using Law Kaki.</p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="lk-name" style={S.label}>Full name (per MyKad)</label>
        <input
          id="lk-name"
          type="text"
          className="lk-input"
          placeholder="e.g. Ahmad bin Abdullah"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
        />
      </div>

      {/* Firm selector */}
      <div style={{ position: "relative" }}>
        <label htmlFor="lk-firm" style={S.label}>Your law firm</label>
        <input
          id="lk-firm"
          type="text"
          className="lk-input"
          placeholder="Search by firm name…"
          value={firm ? firm.name : query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setFirm(null);
            setOpen(true);
            setError("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#FFFFFF",
              border: "1.5px solid #E0DDD3",
              borderRadius: 12,
              boxShadow: "0 16px 40px -8px rgba(15,31,51,0.15)",
              zIndex: 50,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {matches.length > 0 ? matches.map((f) => (
              <button
                key={f.id}
                type="button"
                onMouseDown={() => { setFirm(f); setQuery(""); setOpen(false); setError(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#0F1F33",
                  fontFamily: "inherit",
                  textAlign: "left",
                  gap: 8,
                }}
              >
                <span style={{ fontWeight: 600, flex: 1 }}>{f.name}</span>
                <span style={{ fontSize: 11, color: "#6B7280", flexShrink: 0 }}>{f.state}</span>
              </button>
            )) : (
              <div style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>
                No match — check the spelling or contact your admin.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role selection */}
      <div>
        <label style={S.label}>How will you use Law Kaki?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROLES.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setError(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  border: `1.5px solid ${active ? "#0F1F33" : "#E0DDD3"}`,
                  borderRadius: 12,
                  background: active ? "#FAF7F2" : "#FFFFFF",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  width: "100%",
                  transition: "border-color 140ms cubic-bezier(0.2,0.6,0.2,1), background 140ms cubic-bezier(0.2,0.6,0.2,1)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: active ? "#0F1F33" : "#F0EDE5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: active ? "#FAF7F2" : "#6B7280",
                    flexShrink: 0,
                    transition: "background 140ms cubic-bezier(0.2,0.6,0.2,1), color 140ms cubic-bezier(0.2,0.6,0.2,1)",
                  }}
                >
                  <Icon d={r.icon} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1F33", letterSpacing: "-0.01em" }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
                    {r.desc}
                  </div>
                </div>
                {active && (
                  <div style={{ color: "#0F1F33", flexShrink: 0 }}>
                    <Icon d={I.check} size={16} sw={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p style={S.error}>{error}</p>}

      <button
        type="submit"
        className="lk-btn lk-btn--accent lk-btn--lg"
        disabled={loading || !name.trim() || !firm || !role}
        style={{ width: "100%" }}
      >
        {loading ? "Checking your details…" : "I'm in. Let's go. →"}
      </button>
    </form>
  );
}

/* ============================================================
   Step 4 — Success
   ============================================================ */
const SUCCESS: Record<UserRole, { headline: string; body: string; cta: string }> = {
  poster: {
    headline: "You're in, kaki.",
    body:     "Your colleagues are ready to help. Post your first appointment and get it covered.",
    cta:      "Post your first job",
  },
  picker: {
    headline: "You're in, kaki.",
    body:     "Open jobs are waiting near you. Browse the map and earn on your schedule.",
    cta:      "Explore open jobs",
  },
  both: {
    headline: "You're in, kaki.",
    body:     "Post when you need cover. Pick up when you're free. Law Kaki works around you.",
    cta:      "Open the dashboard",
  },
};

function SuccessStep({ role, onDone }: { role: UserRole; onDone: () => void }) {
  const copy = SUCCESS[role];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      {/* Amber check circle */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          background: "#E89020",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0F1F33",
          boxShadow: "0 12px 28px -6px rgba(232,144,32,0.4)",
        }}
      >
        <Icon d={I.check} size={32} sw={2.5} />
      </div>

      <div>
        <h1 style={{ ...S.headline, textAlign: "center" }}>{copy.headline}</h1>
        <p style={{ ...S.body, textAlign: "center" }}>{copy.body}</p>
      </div>

      <button
        onClick={onDone}
        className="lk-btn lk-btn--accent lk-btn--lg"
        style={{ width: "100%" }}
      >
        {copy.cta} <Icon d={I.arrowR} size={16} />
      </button>
    </div>
  );
}

/* ============================================================
   State machine
   ============================================================ */
type Step =
  | { name: "phone" }
  | { name: "otp";     phone: string }
  | { name: "profile"; phone: string; sessionToken: string }
  | { name: "success"; phone: string; role: UserRole; appToken: string; userName: string };

/* ============================================================
   Main export
   ============================================================ */
export default function LoginFlow({ onSuccess }: { onSuccess: (token: string, userName: string) => void }) {
  const [step, setStep] = useState<Step>({ name: "phone" });

  const dotIndex: 0 | 1 | 2 =
    step.name === "phone" || step.name === "otp" ? 0
    : step.name === "profile" ? 1
    : 2;

  return (
    // position:fixed + overflow-y:auto scrolls independently of body { overflow:hidden }
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#FAF7F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#FFFFFF",
          border: "1px solid #E0DDD3",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 4px 24px -8px rgba(15,31,51,0.12)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <LogoMark height={32} />
        </div>

        {/* Step progress */}
        {step.name !== "success" && (
          <div style={{ marginBottom: 28 }}>
            <StepDots activeIndex={dotIndex} />
          </div>
        )}

        {/* Steps */}
        {step.name === "phone" && (
          <PhoneStep
            onNext={(phone) => setStep({ name: "otp", phone })}
          />
        )}

        {step.name === "otp" && (
          <OtpStep
            phone={step.phone}
            onNext={(sessionToken) =>
              setStep({ name: "profile", phone: step.phone, sessionToken })
            }
            onBack={() => setStep({ name: "phone" })}
          />
        )}

        {step.name === "profile" && (
          <ProfileStep
            sessionToken={step.sessionToken}
            onNext={(role, appToken, userName) =>
              setStep({ name: "success", phone: step.phone, role, appToken, userName })
            }
          />
        )}

        {step.name === "success" && (
          <SuccessStep
            role={step.role}
            onDone={() => onSuccess(step.appToken, step.userName)}
          />
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: "#6B7280", textAlign: "center", lineHeight: 1.6 }}>
        Law Kaki · Internal use only · KL &amp; Selangor
      </p>
    </div>
  );
}
