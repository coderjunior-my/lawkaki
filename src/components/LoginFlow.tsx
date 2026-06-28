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
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const I = {
  arrowR:    "M5 12h14M12 5l7 7-7 7",
  arrowL:    "M19 12H5M12 5l-7 7 7 7",
  check:     "M20 6 9 17l-5-5",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  building:  ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4", "M10 10h4", "M10 14h4", "M10 18h4"],
  briefcase: ["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z", "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"],
  mapPin:    ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"],
  user:      ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  search:    ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.35-4.35"],
  chevD:     "m6 9 6 6 6-6",
};

/* ============================================================
   WhatsApp icon (brand green)
   ============================================================ */
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        fill="#25D366"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
        stroke="#25D366"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

/* ============================================================
   Logo mark — pin shape, inline SVG
   ============================================================ */
function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 80 100" fill="none" aria-label="Law Kaki">
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
  );
}

/* ============================================================
   Step progress dots
   ============================================================ */
function StepDots({ current, total = 3 }: { current: number; total?: number }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 999,
            background: i <= current ? "#0F1F33" : "#E0DDD3",
            opacity: i < current ? 0.35 : 1,
            transition: "all 220ms cubic-bezier(0.2,0.6,0.2,1)",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Auth shell — full-page centred layout, no card
   ============================================================ */
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "var(--off-white)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </div>

      {/* Fixed footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "14px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 20,
          fontSize: 12,
          color: "var(--warm-grey)",
          fontWeight: 500,
          background: "var(--off-white)",
          borderTop: "1px solid var(--hair)",
        }}
      >
        <span>© 2026 Law Kaki</span>
        <span>·</span>
        <a href="#" style={{ color: "var(--warm-grey)" }}>Privacy</a>
        <a href="#" style={{ color: "var(--warm-grey)" }}>Terms</a>
      </div>
    </div>
  );
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

function isValidMYPhone(phone: string): boolean {
  return /^\+601\d{7,9}$/.test(phone);
}

const labelSt: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--black)",
  letterSpacing: "-0.005em",
  display: "block",
  marginBottom: 8,
};

/* ============================================================
   SCREEN 1 — Phone number entry
   ============================================================ */
function PhoneStep({ onNext }: { onNext: (phone: string) => void }) {
  const [value, setValue]  = useState("");
  const [error, setError]  = useState("");
  const [loading, setLoad] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const digits = value.replace(/\D/g, "").slice(0, 11);
  const valid  = digits.length >= 9;

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
      const res  = await fetch("/api/auth/send-otp", {
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
    <AuthShell>
      <StepDots current={0} total={3} />
      <LogoMark size={52} />

      <h1
        style={{
          fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em",
          textAlign: "center", marginTop: 20, marginBottom: 6, lineHeight: 1.15,
        }}
      >
        Hi kaki, let&apos;s get you in.
      </h1>
      <p
        style={{
          textAlign: "center", color: "var(--warm-grey)", fontSize: 14,
          marginBottom: 32, maxWidth: 340, lineHeight: 1.5,
        }}
      >
        Enter your mobile number. We&apos;ll send a one-time code via WhatsApp to verify.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Phone input with Malaysia flag prefix */}
        <div>
          <label style={labelSt}>Mobile number</label>
          <div
            className="phone-wrap"
            style={{
              display: "flex", alignItems: "center",
              border: "1.5px solid var(--hair)", borderRadius: 14, overflow: "hidden",
              background: "#FFF",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
                height: 52, borderRight: "1px solid var(--hair)", flexShrink: 0,
                background: "var(--off-white)",
              }}
            >
              {/* Malaysia flag */}
              <svg width={22} height={16} viewBox="0 0 22 16" style={{ borderRadius: 2 }} aria-hidden>
                <rect width="22" height="16" fill="#CC0001" rx="2"/>
                <rect y="0"     width="22" height="2.28" fill="#CC0001"/>
                <rect y="2.28"  width="22" height="2.28" fill="#FFF"/>
                <rect y="4.56"  width="22" height="2.28" fill="#CC0001"/>
                <rect y="6.84"  width="22" height="2.28" fill="#FFF"/>
                <rect y="9.12"  width="22" height="2.28" fill="#CC0001"/>
                <rect y="11.4"  width="22" height="2.28" fill="#FFF"/>
                <rect y="13.68" width="22" height="2.32" fill="#CC0001"/>
                <rect width="11" height="9.12" fill="#010066"/>
                <circle cx="5"   cy="4.56" r="2.5" fill="#FC0"/>
                <circle cx="5.8" cy="4.56" r="2"   fill="#010066"/>
              </svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--black)", fontVariantNumeric: "tabular-nums" }}>
                +60
              </span>
            </div>
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              value={digits}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
              placeholder="12-3456 7890"
              aria-label="Mobile number"
              style={{
                flex: 1, height: 52, padding: "0 16px", border: "none", outline: "none",
                fontFamily: "inherit", fontSize: 17, fontWeight: 600, color: "var(--black)",
                letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums", background: "transparent",
              }}
            />
          </div>
          {error && (
            <p style={{ color: "var(--red)", fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>{error}</p>
          )}
        </div>

        {/* WhatsApp delivery note */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
            background: "#FFF", border: "1px solid var(--hair)", borderRadius: 10,
          }}
        >
          <WhatsAppIcon size={18} />
          <span style={{ fontSize: 13, color: "var(--warm-grey)", lineHeight: 1.4 }}>
            OTP will arrive in your{" "}
            <strong style={{ color: "var(--black)" }}>WhatsApp</strong> inbox. Keep the app open.
          </span>
        </div>

        <button
          type="submit"
          className="lk-btn lk-btn--lg"
          disabled={loading || !valid}
          style={{ width: "100%", height: 52, fontSize: 15 }}
        >
          {loading ? "Sending code…" : <><span>Send verification code</span><Icon d={I.arrowR} size={18} /></>}
        </button>
      </form>

      {/* Security note */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8, marginTop: 20,
          fontSize: 12, color: "var(--warm-grey)", justifyContent: "center",
        }}
      >
        <Icon d={I.shield} size={14} />
        <span>Your number is only used for login. Never shared.</span>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN 2 — OTP verification
   ============================================================ */
const OTP_LEN = 6;

type OtpResult =
  | { existing: true;  token: string; userId: string; name: string }
  | { existing: false; sessionToken: string };

function OtpStep({
  phone,
  onNext,
  onBack,
}: {
  phone: string;
  onNext: (result: OtpResult) => void;
  onBack: () => void;
}) {
  const [digits, setDigits]       = useState<string[]>(Array(OTP_LEN).fill(""));
  const [error, setError]         = useState("");
  const [loading, setLoad]        = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resending, setResend]    = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LEN).fill(null));

  useEffect(() => { refs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function verify(code: string) {
    setLoad(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That code didn't work.");
      onNext(
        data.existing
          ? { existing: true,  token: data.token, userId: data.userId, name: data.name }
          : { existing: false, sessionToken: data.sessionToken }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Try again.");
      setDigits(Array(OTP_LEN).fill(""));
      refs.current[0]?.focus();
    } finally {
      setLoad(false);
    }
  }

  function setDigit(index: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError("");
    if (char && index < OTP_LEN - 1) refs.current[index + 1]?.focus();
    // Auto-verify on last digit
    if (next.every((d) => d) && char) {
      setTimeout(() => verify(next.join("")), 200);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && index > 0)           { e.preventDefault(); refs.current[index - 1]?.focus(); }
    if (e.key === "ArrowRight" && index < OTP_LEN - 1) { e.preventDefault(); refs.current[index + 1]?.focus(); }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    const next   = Array(OTP_LEN).fill("") as string[];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    setError("");
    refs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus();
    if (pasted.length === OTP_LEN) setTimeout(() => verify(next.join("")), 200);
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
      setCountdown(30);
      setDigits(Array(OTP_LEN).fill(""));
      refs.current[0]?.focus();
    } finally {
      setResend(false);
    }
  }

  const suffix      = phone.replace("+60", "");
  const maskedPhone = `+60 ${suffix.slice(0, 2)}-••••${phone.slice(-4)}`;

  return (
    <AuthShell>
      <StepDots current={1} total={3} />

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, padding: "0 0 16px",
          color: "var(--warm-grey)", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
        }}
      >
        <Icon d={I.arrowL} size={16} /> Change number
      </button>

      {/* WhatsApp icon in black circle */}
      <div
        style={{
          width: 56, height: 56, borderRadius: 999, background: "var(--black)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        }}
      >
        <WhatsAppIcon size={26} />
      </div>

      <h1
        style={{
          fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em",
          textAlign: "center", marginBottom: 6, lineHeight: 1.15,
        }}
      >
        Check your WhatsApp
      </h1>
      <p style={{ textAlign: "center", color: "var(--warm-grey)", fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
        We sent a 6-digit code to{" "}
        <strong style={{ color: "var(--black)" }}>{maskedPhone}</strong>
      </p>

      {/* OTP digit boxes */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 10, width: "100%" }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={loading}
            style={{
              width: 52, height: 60, textAlign: "center", fontSize: 24, fontWeight: 700,
              fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
              border: `2px solid ${error ? "var(--red)" : d ? "var(--black)" : "var(--hair)"}`,
              borderRadius: 12, outline: "none",
              background: d ? "#FFF" : "var(--off-white)",
              color: "var(--black)", transition: "border-color 140ms, background 140ms",
              caretColor: "var(--amber)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--black)";
              e.target.style.boxShadow   = "0 0 0 4px rgba(15,31,51,0.06)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = d ? "var(--black)" : "var(--hair)";
              e.target.style.boxShadow   = "none";
            }}
            aria-label={`Digit ${i + 1} of ${OTP_LEN}`}
          />
        ))}
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: 13, fontWeight: 600, textAlign: "center", marginTop: 4 }}>
          Invalid code. Check your WhatsApp and try again.
        </p>
      )}
      {loading && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            color: "var(--black)", fontSize: 13, fontWeight: 600, marginTop: 4,
          }}
        >
          <span className="auth-spinner" /> Verifying...
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20 }}>
        {countdown > 0 ? (
          <span style={{ fontSize: 13, color: "var(--warm-grey)" }}>
            Resend code in{" "}
            <strong style={{ fontVariantNumeric: "tabular-nums" }}>{countdown}s</strong>
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending || loading}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--black)",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN 3 — Profile setup (new users)
   ============================================================ */
const ROLES: { value: UserRole; label: string; desc: string; icon: string | string[] }[] = [
  { value: "poster", label: "Post jobs", desc: "Delegate signing appointments to other lawyers.", icon: I.briefcase },
  { value: "picker", label: "Pick jobs", desc: "Take on jobs from colleagues and earn a fee.",    icon: I.mapPin    },
  { value: "both",   label: "Both",      desc: "Post when you need help, pick when you have time.", icon: I.user   },
];

function ProfileStep({
  sessionToken,
  onNext,
  onBack,
}: {
  sessionToken: string;
  onNext: (
    role: UserRole,
    appToken: string,
    userId: string,
    userName: string,
    firmName: string,
    email: string
  ) => void;
  onBack: () => void;
}) {
  const [name, setName]             = useState("");
  const [firm, setFirm]             = useState<LawFirmOption | null>(null);
  const [firmSearch, setFirmSearch] = useState("");
  const [firmOpen, setFirmOpen]     = useState(false);
  const [email, setEmail]           = useState("");
  const [role, setRole]             = useState<UserRole | null>(null);
  const [error, setError]           = useState("");
  const [loading, setLoad]          = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const firmMatches = (firmSearch
    ? LAW_FIRMS.filter((f) => f.name.toLowerCase().includes(firmSearch.toLowerCase()))
    : LAW_FIRMS
  ).slice(0, 12);

  const valid = name.trim() && firm && email.includes("@") && role;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setLoad(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, name: name.trim(), firmId: firm!.id, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      onNext(role!, data.token, data.userId, name.trim(), firm!.name, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoad(false);
    }
  }

  return (
    <AuthShell>
      <StepDots current={2} total={3} />

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, padding: "0 0 16px",
          color: "var(--warm-grey)", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
        }}
      >
        <Icon d={I.arrowL} size={16} /> Back
      </button>

      <h1
        style={{
          fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em",
          textAlign: "center", marginBottom: 6, lineHeight: 1.15, width: "100%",
        }}
      >
        Set up your profile
      </h1>
      <p
        style={{
          textAlign: "center", color: "var(--warm-grey)", fontSize: 14,
          marginBottom: 28, lineHeight: 1.5, maxWidth: 360,
        }}
      >
        A few details so jobs can find you and you can find jobs.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Full name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelSt}>
            Full name <span style={{ color: "var(--amber)" }}>*</span>
          </label>
          <input
            className="lk-input"
            placeholder="e.g. Izzat Yusoff"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            style={{ borderRadius: 14 }}
          />
        </div>

        {/* Law firm — two-state searchable dropdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
          <label style={labelSt}>
            Law firm <span style={{ color: "var(--amber)" }}>*</span>
          </label>

          {firm && !firmOpen ? (
            /* Selected state */
            <button
              type="button"
              onClick={() => { setFirmOpen(true); setFirmSearch(""); setTimeout(() => searchRef.current?.focus(), 50); }}
              style={{
                width: "100%", height: 48, padding: "0 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#FFF", border: "1.5px solid var(--hair)",
                borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                fontSize: 15, fontWeight: 500, color: "var(--black)", textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon d={I.building} size={16} style={{ color: "var(--warm-grey)" }} />
                {firm.name}
              </span>
              <Icon d={I.chevD} size={16} style={{ color: "var(--warm-grey)" }} />
            </button>
          ) : (
            /* Search state */
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  color: "var(--warm-grey)", display: "flex", pointerEvents: "none",
                }}
              >
                <Icon d={I.search} size={16} />
              </div>
              <input
                ref={searchRef}
                className="lk-input"
                placeholder="Search your law firm…"
                value={firmSearch}
                onChange={(e) => { setFirmSearch(e.target.value); setFirmOpen(true); }}
                onFocus={() => setFirmOpen(true)}
                style={{ paddingLeft: 44, borderRadius: 14 }}
              />
            </div>
          )}

          {firmOpen && (
            <>
              <div
                style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
                  background: "#FFF", border: "1px solid var(--hair)", borderRadius: 12,
                  boxShadow: "0 16px 40px -8px rgba(15,31,51,0.18)", padding: 4,
                  maxHeight: 240, overflowY: "auto",
                }}
              >
                {firmMatches.length === 0 ? (
                  <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--warm-grey)" }}>
                    No firms found.
                  </div>
                ) : (
                  firmMatches.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFirm(f);
                        setFirmOpen(false);
                        setFirmSearch("");
                        setError("");
                      }}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 14px",
                        background: firm?.id === f.id ? "var(--off-white)" : "transparent",
                        border: "none", borderRadius: 8, cursor: "pointer",
                        fontFamily: "inherit", fontSize: 14,
                        fontWeight: firm?.id === f.id ? 600 : 400,
                        color: "var(--black)", display: "flex", alignItems: "center", gap: 10,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--off-white)"; }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          firm?.id === f.id ? "var(--off-white)" : "transparent";
                      }}
                    >
                      <Icon d={I.building} size={14} style={{ color: "var(--warm-grey)", flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{f.name}</span>
                      <span style={{ fontSize: 11, color: "var(--warm-grey)", flexShrink: 0 }}>{f.state}</span>
                      {firm?.id === f.id && (
                        <Icon d={I.check} size={14} style={{ color: "var(--black)", flexShrink: 0 }} />
                      )}
                    </button>
                  ))
                )}
              </div>
              {/* Click-away overlay */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 19 }}
                onClick={() => setFirmOpen(false)}
              />
            </>
          )}
        </div>

        {/* Law firm email */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelSt}>
            Law firm email <span style={{ color: "var(--amber)" }}>*</span>
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <div
              style={{
                position: "absolute", left: 16, color: "var(--warm-grey)",
                display: "flex", pointerEvents: "none",
              }}
            >
              <Icon d={I.mail} size={16} />
            </div>
            <input
              className="lk-input"
              placeholder="izzat@tanandco.com.my"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              type="email"
              style={{ paddingLeft: 44, borderRadius: 14 }}
            />
          </div>
          <div
            style={{
              display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px",
              background: "var(--pale-grey)", borderRadius: 10,
            }}
          >
            <Icon d={I.shield} size={14} style={{ color: "var(--warm-grey)", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "var(--warm-grey)", lineHeight: 1.4 }}>
              We won&apos;t send anything to this address. It&apos;s used{" "}
              <strong style={{ color: "var(--black)" }}>only to verify</strong> you&apos;re a practising lawyer.
            </span>
          </div>
        </div>

        {/* Role selection — radio cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={labelSt}>
            What would you like to do? <span style={{ color: "var(--amber)" }}>*</span>
          </label>
          {ROLES.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setError(""); }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px",
                  background: active ? "var(--off-white)" : "#FFF",
                  border: `2px solid ${active ? "var(--black)" : "var(--hair)"}`,
                  borderRadius: 14, cursor: "pointer", textAlign: "left",
                  fontFamily: "inherit", width: "100%",
                  transition: "border-color 140ms, background 140ms",
                }}
              >
                {/* Radio dot */}
                <div
                  style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${active ? "var(--black)" : "var(--hair)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 140ms",
                  }}
                >
                  {active && (
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--black)" }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 3, color: "var(--black)" }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--warm-grey)", lineHeight: 1.4 }}>
                    {r.desc}
                  </div>
                </div>
                <Icon
                  d={r.icon}
                  size={20}
                  style={{ color: active ? "var(--black)" : "var(--warm-grey)", flexShrink: 0, marginTop: 2 }}
                />
              </button>
            );
          })}
        </div>

        {error && (
          <p style={{ color: "var(--red)", fontSize: 13, lineHeight: 1.4, margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          className="lk-btn lk-btn--lg"
          disabled={loading || !valid}
          style={{ width: "100%", height: 52, fontSize: 15 }}
        >
          {loading
            ? "Creating account…"
            : <><span>Create account</span><Icon d={I.arrowR} size={18} /></>}
        </button>
      </form>
    </AuthShell>
  );
}

/* ============================================================
   SCREEN 4 — Welcome / success
   ============================================================ */
interface ProfileData {
  name:     string;
  firmName: string;
  email:    string;
  role:     UserRole;
}

const ROLE_LABEL: Record<UserRole, string> = {
  poster: "Poster",
  picker: "Picker",
  both:   "Poster & Picker",
};

function SuccessStep({
  profile,
  onDone,
}: {
  profile: ProfileData;
  onDone: () => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AuthShell>
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(16px)",
          transition: "all 380ms cubic-bezier(0.2,0.6,0.2,1)",
          width: "100%",
        }}
      >
        {/* Black check circle */}
        <div
          style={{
            width: 72, height: 72, borderRadius: 999, background: "var(--black)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
          }}
        >
          <Icon d={I.check} size={32} sw={3} style={{ color: "var(--off-white)" }} />
        </div>

        <h1
          style={{
            fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em",
            textAlign: "center", marginBottom: 8, lineHeight: 1.15,
          }}
        >
          You&apos;re in, kaki.
        </h1>
        <p
          style={{
            textAlign: "center", color: "var(--warm-grey)", fontSize: 15,
            marginBottom: 36, lineHeight: 1.5, maxWidth: 340,
          }}
        >
          Your account is set up and ready. Time to find your first job — or post one.
        </p>

        {/* Profile summary card */}
        <div
          style={{
            width: "100%", background: "#FFF", border: "1px solid var(--hair)",
            borderRadius: 14, padding: "20px 22px", marginBottom: 28,
            display: "flex", flexDirection: "column", gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              className="lk-avatar lk-avatar--lg"
              style={{
                background: "var(--black)", color: "var(--off-white)",
                fontSize: 18, fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--warm-grey)", marginTop: 2 }}>
                {profile.firmName}
              </div>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--pale-grey)", paddingTop: 14,
              display: "flex", gap: 8, flexWrap: "wrap",
            }}
          >
            <span className="lk-chip lk-chip--sm lk-chip--solid">{ROLE_LABEL[profile.role]}</span>
            <span className="lk-chip lk-chip--sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon d={I.mail} size={12} />{profile.email}
            </span>
          </div>
        </div>

        <button
          onClick={onDone}
          className="lk-btn lk-btn--accent lk-btn--lg"
          style={{ width: "100%", height: 52, fontSize: 15 }}
        >
          Go to dashboard <Icon d={I.arrowR} size={18} />
        </button>

        <p style={{ textAlign: "center", color: "var(--warm-grey)", fontSize: 12, marginTop: 16 }}>
          Terima kasih, kaki.
        </p>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   State machine
   ============================================================ */
type Step =
  | { name: "phone" }
  | { name: "otp";     phone: string }
  | { name: "profile"; phone: string; sessionToken: string }
  | { name: "success"; phone: string; role: UserRole; appToken: string; userId: string; userName: string; firmName: string; email: string };

/* ============================================================
   Main export
   ============================================================ */
export default function LoginFlow({
  onSuccess,
}: {
  onSuccess: (token: string, userId: string, userName: string, phone: string) => void;
}) {
  const [step, setStep] = useState<Step>({ name: "phone" });

  return (
    <>
      {step.name === "phone" && (
        <PhoneStep
          onNext={(phone) => setStep({ name: "otp", phone })}
        />
      )}

      {step.name === "otp" && (
        <OtpStep
          phone={step.phone}
          onNext={(result) => {
            if (result.existing) {
              onSuccess(result.token, result.userId, result.name, step.phone);
            } else {
              setStep({ name: "profile", phone: step.phone, sessionToken: result.sessionToken });
            }
          }}
          onBack={() => setStep({ name: "phone" })}
        />
      )}

      {step.name === "profile" && (
        <ProfileStep
          sessionToken={step.sessionToken}
          onNext={(role, appToken, userId, userName, firmName, email) =>
            setStep({ name: "success", phone: step.phone, role, appToken, userId, userName, firmName, email })
          }
          onBack={() => setStep({ name: "otp", phone: step.phone })}
        />
      )}

      {step.name === "success" && (
        <SuccessStep
          profile={{
            name:     step.userName,
            firmName: step.firmName,
            email:    step.email,
            role:     step.role,
          }}
          onDone={() => onSuccess(step.appToken, step.userId, step.userName, step.phone)}
        />
      )}
    </>
  );
}
