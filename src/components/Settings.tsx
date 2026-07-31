"use client";

import { useState, useRef, useEffect, useCallback, CSSProperties } from "react";
import { PLATFORM_BANK_DETAILS as PLATFORM_BANK } from "@/lib/billing";
import { MALAYSIAN_BANKS } from "@/lib/banks";

/* ============================================================
   Icons (Lucide-style, outlined, 2px stroke)
   ============================================================ */
interface IP { d?: string | string[]; size?: number; sw?: number; style?: CSSProperties; children?: React.ReactNode }
function Ic({ d, size = 20, sw = 2, style, children }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={style}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p}/>) : (d ? <path d={d}/> : null)}
      {children}
    </svg>
  );
}
const IC = {
  user:      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  edit:      "m12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  phone:     ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  building:  ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4", "M10 10h4", "M10 14h4", "M10 18h4"],
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  check:     "M20 6 9 17l-5-5",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bell:      "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  credit:    "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  package:   "M16.5 9.4l-9-5.19 M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
  file:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  chevD:     "m6 9 6 6 6-6",
  chevR:     "m9 18 6-6-6-6",
  arrowL:    "m19 12H5 m7-7-7 7 7 7",
  exit:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  lock:      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  cal:       "M16 2v4M8 2v4M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  alert:     "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
};

/* ============================================================
   Types
   ============================================================ */
type SettingsTab  = "profile" | "history" | "billing";
type HistFilter   = "all" | "paid" | "pending" | "overdue";
type UserRole     = "post" | "pick" | "both";
type JobRole      = "picker" | "poster";
type PayStatus    = "paid" | "pending" | "overdue";

interface User {
  name: string; initials: string; phone: string; email: string;
  firm: string; role: UserRole; joinedDate: string; joinedDays: number;
  rating: number; totalJobs: number; totalEarnings: number;
  availability: Record<string, boolean>; coverageAreas: string[];
  bankName: string; bankAccount: string;
  notifications: { whatsappAlerts: boolean; jobReminders: boolean; paymentConfirm: boolean; weeklyDigest: boolean };
  certUploaded: boolean; certExpiry: string;
}
interface HistJob {
  id: string; date: string; venue: string; docType: string; area: string;
  fee: number; role: JobRole; payment: PayStatus; paidDate: string | null;
}
/* ============================================================
   Constants
   ============================================================ */
const LAW_FIRMS = [
  "Azmi & Associates", "Christopher & Lee Ong", "Gan & Zul",
  "Kadir Andri & Partners", "Lee Hishammuddin Allen & Gledhill",
  "Lim & Partners", "Mohanadass Partnership", "Rahmat Lim & Partners",
  "Shearn Delamore & Co.", "Shook Lin & Bok", "Skrine",
  "Tan & Co.", "Wong & Partners", "Zaid Ibrahim & Co.", "Zul Rafique & Partners", "Other",
];
const AREAS = ["KLCC", "Mont Kiara", "Bangsar", "Petaling Jaya", "Cheras", "Damansara Heights", "Subang Jaya", "Shah Alam", "Cyberjaya", "Putrajaya"];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };
const TABS: { id: SettingsTab; label: string; icon: string | string[] }[] = [
  { id: "profile",  label: "Profile",     icon: IC.user },
  { id: "history",  label: "Job history", icon: IC.briefcase },
  { id: "billing",  label: "Billing",     icon: IC.credit },
];
const TAB_SUBS: Record<SettingsTab, string> = {
  profile:  "Manage your account details, availability, and preferences.",
  history:  "All your completed jobs and payment status.",
  billing:  "Pay your platform fee and manage payment history.",
};

/* ============================================================
   Mock data
   ============================================================ */
const INIT_USER: User = {
  name: "Izzat Yusoff", initials: "IY", phone: "+60 12-3456 7890",
  email: "izzat@tanandco.com.my", firm: "Tan & Co.", role: "both",
  joinedDate: "14 Jan 2026", joinedDays: 156, rating: 4.9, totalJobs: 23, totalEarnings: 3840,
  availability: { mon:true, tue:true, wed:true, thu:true, fri:true, sat:false, sun:false },
  coverageAreas: ["KLCC", "Mont Kiara", "Bangsar", "Petaling Jaya"],
  bankName: "Maybank", bankAccount: "•••• •••• 4521",
  notifications: { whatsappAlerts:true, jobReminders:true, paymentConfirm:true, weeklyDigest:false },
  certUploaded: true, certExpiry: "Dec 2026",
};
const INIT_HISTORY: HistJob[] = [
  { id:"h1", date:"Today",   venue:"Wisma Damansara",      docType:"Discharge of Charge",    area:"Damansara Heights", fee:180, role:"picker", payment:"paid",    paidDate:"19 Jun 2026" },
  { id:"h2", date:"15 Jun",  venue:"Bangsar Village II",   docType:"SPA Signing",            area:"Bangsar",           fee:120, role:"picker", payment:"pending",  paidDate:null },
  { id:"h3", date:"10 Jun",  venue:"Public Bank · KLCC",   docType:"Loan Documentation",     area:"KLCC",              fee:220, role:"poster", payment:"paid",    paidDate:"12 Jun 2026" },
  { id:"h4", date:"5 Jun",   venue:"Pejabat Tanah PJ",     docType:"Transfer at Land Office",area:"Petaling Jaya",     fee:280, role:"poster", payment:"paid",    paidDate:"7 Jun 2026" },
  { id:"h5", date:"28 May",  venue:"LHDN Cheras",           docType:"Stamping",               area:"Cheras",            fee:95,  role:"picker", payment:"paid",    paidDate:"30 May 2026" },
  { id:"h6", date:"20 May",  venue:"Maybank · Mont Kiara", docType:"SPA Signing",            area:"Mont Kiara",        fee:150, role:"picker", payment:"overdue",  paidDate:null },
];

/* ============================================================
   Shared primitives
   ============================================================ */
function Section({ id, title, action, children }: { id?: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div id={id}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h3 style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.01em", margin:0 }}>{title}</h3>
        {action}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, note }: { icon: string | string[]; label: string; value: string; note?: string }) {
  return (
    <div className="info-row"
      style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 18px", background:"#FFF", border:"1px solid var(--hair)", borderRadius:0, borderBottom:"none" }}>
      <div style={{ width:36, height:36, borderRadius:10, background:"var(--pale-grey)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ic d={icon} size={16} style={{ color:"var(--warm-grey)" }}/>
      </div>
      <div>
        <div style={{ fontSize:12, color:"var(--warm-grey)", fontWeight:600, letterSpacing:"0.02em", marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:15, fontWeight:600 }}>{value}</div>
        {note && <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:3 }}>{note}</div>}
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, padding:"12px 0" }}>
      <label style={{ fontSize:13, fontWeight:600, color:"var(--black)", letterSpacing:"-0.005em" }}>{label}</label>
      {children}
    </div>
  );
}

function NotifToggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="info-row"
      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", background:"#FFF", border:"1px solid var(--hair)", borderRadius:0, borderBottom:"none" }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:2 }}>{desc}</div>
      </div>
      <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked} style={{
        position:"relative", width:48, height:28, padding:0, border:"none", cursor:"pointer",
        background: checked ? "var(--black)" : "var(--pale-grey)", borderRadius:999, flexShrink:0,
        transition:"background 140ms",
      }}>
        <span style={{
          position:"absolute", top:3, left:3, width:22, height:22, background:"#FFF", borderRadius:999,
          boxShadow:"0 1px 3px rgba(15,31,51,0.2)", transition:"transform 140ms",
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}/>
      </button>
    </div>
  );
}

function ActionRow({ icon, label, desc, danger, onClick }: { icon: string | string[]; label: string; desc: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button className="info-row"
      style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"#FFF", border:"1px solid var(--hair)", borderRadius:0, borderBottom:"none", cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"inherit" }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--off-white)")}
      onMouseLeave={e => (e.currentTarget.style.background = "#FFF")}>
      <div style={{ width:36, height:36, borderRadius:10, background: danger ? "var(--red-soft)" : "var(--pale-grey)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ic d={icon} size={16} style={{ color: danger ? "var(--red)" : "var(--warm-grey)" }}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color: danger ? "var(--red)" : "var(--black)" }}>{label}</div>
        <div style={{ fontSize:12, color:"var(--warm-grey)" }}>{desc}</div>
      </div>
      <Ic d={IC.chevR} size={16} style={{ color:"var(--warm-grey)" }}/>
    </button>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:12, padding:"16px 18px", display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ fontSize:11, color:"var(--warm-grey)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em", color:accent }}>{value}</div>
    </div>
  );
}

function PaymentBadge({ status }: { status: PayStatus }) {
  const map: Record<PayStatus, { label: string; bg: string; fg: string; border: string }> = {
    paid:    { label:"Paid",    bg:"var(--green-soft)", fg:"var(--green)", border:"var(--green)" },
    pending: { label:"Pending", bg:"var(--amber-soft)", fg:"#7A4A0F",     border:"var(--amber)" },
    overdue: { label:"Overdue", bg:"var(--red-soft)",   fg:"var(--red)",   border:"var(--red)" },
  };
  const s = map[status];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:s.bg, color:s.fg, border:`1px solid ${s.border}` }}>
      <span style={{ width:5, height:5, borderRadius:999, background:s.fg }}/>{s.label}
    </span>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
   Profile tab
   ============================================================ */
interface BankDetails { bankName: string; accountNumber: string; accountHolderName: string }
const ACCOUNT_NUMBER_RE = /^\d{6,20}$/;

function ProfileTab({
  user, setUser, onSignOut, token, bankDetails, onBankDetailsSaved, focusPayment, isMobile = false,
}: {
  user: User; setUser: (u: User) => void; onSignOut?: () => void;
  token?: string; bankDetails?: BankDetails | null; onBankDetailsSaved?: (d: BankDetails) => void;
  focusPayment?: boolean; isMobile?: boolean;
}) {
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState<User>({ ...user });
  const [firmOpen, setFirmOpen]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const [bankFormOpen, setBankFormOpen]         = useState(false);
  const [bankName, setBankName]                 = useState("");
  const [accountNumber, setAccountNumber]       = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankSaving, setBankSaving]             = useState(false);
  const [bankError, setBankError]               = useState<string | null>(null);

  function openBankForm() {
    setBankName(bankDetails?.bankName ?? "");
    setAccountNumber(bankDetails?.accountNumber ?? "");
    // Defaults to the logged-in user's own name, but it's editable — any
    // account holder (e.g. a spouse's or firm's) is allowed.
    setAccountHolderName(bankDetails?.accountHolderName ?? user.name);
    setBankError(null);
    setBankFormOpen(true);
  }

  // Jump straight to Payment details (form open, scrolled into view) when
  // arriving via the "Add bank details" critical notice, so the poster
  // doesn't have to hunt for it further down the page.
  useEffect(() => {
    if (!focusPayment) return;
    openBankForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPayment]);

  useEffect(() => {
    if (!focusPayment || !bankFormOpen) return;
    // Wait for the now-expanded form to actually paint (it's much taller
    // than the collapsed view) before measuring where to scroll to —
    // scrolling against the pre-expansion layout lands short/long.
    const raf = requestAnimationFrame(() => {
      document.getElementById("lk-settings-payment-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [focusPayment, bankFormOpen]);

  async function saveBankDetails() {
    if (!token) return;
    if (!accountHolderName.trim()) { setBankError("Enter the account holder's name."); return; }
    if (!bankName) { setBankError("Select your bank."); return; }
    if (!ACCOUNT_NUMBER_RE.test(accountNumber)) {
      setBankError("Enter a valid account number (digits only, 6–20 characters).");
      return;
    }
    setBankSaving(true);
    setBankError(null);
    try {
      const res = await fetch("/api/users/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bankName, accountNumber, accountHolderName: accountHolderName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setBankError(data.error ?? "Failed to save."); return; }
      onBankDetailsSaved?.({ bankName, accountNumber, accountHolderName: accountHolderName.trim() });
      setBankFormOpen(false);
    } finally {
      setBankSaving(false);
    }
  }

  const roleLabels: Record<UserRole, string> = { post:"Post jobs", pick:"Pick jobs", both:"Both" };
  const roles = [
    { id:"post" as UserRole, label:"Post jobs",  desc:"Delegate signing appointments" },
    { id:"pick" as UserRole, label:"Pick jobs",  desc:"Take on jobs and earn fees" },
    { id:"both" as UserRole, label:"Both",       desc:"Post and pick as needed" },
  ];

  const emailError = draft.email.length > 0 && !isValidEmail(draft.email);
  const save = () => {
    if (!isValidEmail(draft.email)) return;
    setUser(draft); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2400);
  };
  const cancel = () => { setDraft({ ...user }); setEditing(false); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {/* Profile header card */}
      <div style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:14, padding: isMobile ? "18px 18px" : "24px 28px", display:"flex", alignItems:"center", gap: isMobile ? 14 : 20, flexWrap:"wrap" }}>
        <div style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius:999, background:"var(--black)", color:"var(--off-white)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: isMobile ? 18 : 24, fontWeight:700, flexShrink:0 }}>
          {user.initials}
        </div>
        <div style={{ flex:1, minWidth: isMobile ? 180 : undefined }}>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.2 }}>{user.name}</div>
          <div style={{ fontSize:14, color:"var(--warm-grey)", marginTop:4 }}>{user.firm}</div>
          <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
            <span className="lk-chip lk-chip--sm lk-chip--solid">{roleLabels[user.role]}</span>
            <span className="lk-chip lk-chip--sm"><Ic d={IC.star} size={12} style={{ fill:"var(--amber)", stroke:"var(--amber)" }}/>{user.rating}</span>
            <span className="lk-chip lk-chip--sm"><Ic d={IC.briefcase} size={12}/>{user.totalJobs} jobs</span>
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "right", flexShrink:0 }}>
          <div style={{ fontSize:11, color:"var(--warm-grey)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>Member since</div>
          <div style={{ fontSize:15, fontWeight:700, marginTop:4 }}>{user.joinedDate}</div>
          <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:2 }}>{user.joinedDays} days</div>
        </div>
      </div>

      {/* Saved confirmation */}
      {saved && (
        <div style={{ padding:"12px 16px", background:"var(--green-soft)", border:"1px solid var(--green)", borderRadius:10, display:"flex", alignItems:"center", gap:10, fontSize:13, fontWeight:600, color:"var(--green)" }}>
          <Ic d={IC.check} size={16}/> Profile updated.
        </div>
      )}

      {!editing ? (
        <>
          {/* View mode */}
          <Section title="Personal details" action={<button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={() => { setDraft({...user}); setEditing(true); }}><Ic d={IC.edit} size={14}/> Edit</button>}>
            <InfoRow icon={IC.user}      label="Full name"       value={user.name}/>
            <InfoRow icon={IC.phone}     label="Mobile number"   value={user.phone}/>
            <InfoRow icon={IC.mail}      label="Law firm email"  value={user.email} note="Used for verification only. We don't send emails here."/>
            <InfoRow icon={IC.building}  label="Law firm"        value={user.firm}/>
            <InfoRow icon={IC.briefcase} label="Role"            value={roleLabels[user.role]}/>
          </Section>

          <Section title="Practising certificate">
            <input ref={fileRef} type="file" accept=".pdf,image/*" style={{ display:"none" }}
              onChange={e => { if (e.target.files?.[0]) setUser({ ...user }); }}/>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", background:"#FFF", border:"1px solid var(--hair)", borderRadius:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background: user.certUploaded ? "var(--green-soft)" : "var(--pale-grey)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ic d={user.certUploaded ? IC.check : IC.upload} size={18} style={{ color: user.certUploaded ? "var(--green)" : "var(--warm-grey)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600 }}>{user.certUploaded ? "Certificate uploaded" : "Not uploaded"}</div>
                  <div style={{ fontSize:12, color:"var(--warm-grey)" }}>{user.certUploaded ? `Valid until ${user.certExpiry}` : "Upload to build trust with other kakis"}</div>
                </div>
              </div>
              <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={() => fileRef.current?.click()}>
                {user.certUploaded ? "Replace" : "Upload"}
              </button>
            </div>
          </Section>
        </>
      ) : (
        /* Edit mode */
        <Section title="Edit profile" action={
          <div style={{ display:"flex", gap:8 }}>
            <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={cancel}>Cancel</button>
            <button className="lk-btn lk-btn--sm" disabled={emailError} onClick={save}><Ic d={IC.check} size={14}/> Save</button>
          </div>
        }>
          <EditField label="Full name">
            <input className="lk-input" value={draft.name} onChange={e => setDraft({...draft, name:e.target.value})} style={{ borderRadius:12 }}/>
          </EditField>
          <EditField label="Mobile number">
            <input className="lk-input" value={draft.phone} disabled style={{ borderRadius:12, opacity:0.5, cursor:"not-allowed" }}/>
            <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:4 }}>To change your number, go to Security below.</div>
          </EditField>
          <EditField label="Law firm email">
            <input
              className="lk-input" type="email" value={draft.email}
              onChange={e => setDraft({...draft, email:e.target.value})}
              style={{ borderRadius:12, borderColor: emailError ? "var(--red)" : undefined }}
            />
            {emailError
              ? <div style={{ fontSize:12, color:"var(--red)", marginTop:4 }}>Enter a valid email address.</div>
              : <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:4 }}>Used for verification only. We won&apos;t send anything here.</div>}
          </EditField>
          <EditField label="Law firm">
            <div style={{ position:"relative" }}>
              <button onClick={() => setFirmOpen(!firmOpen)} style={{ width:"100%", height:48, padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FFF", border:"1.5px solid var(--hair)", borderRadius:12, cursor:"pointer", fontFamily:"inherit", fontSize:15, fontWeight:500, color:"var(--black)", textAlign:"left" }}>
                {draft.firm} <Ic d={IC.chevD} size={16} style={{ color:"var(--warm-grey)" }}/>
              </button>
              {firmOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:19 }} onClick={() => setFirmOpen(false)}/>
                  <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:20, background:"#FFF", border:"1px solid var(--hair)", borderRadius:12, boxShadow:"0 16px 40px -8px rgba(15,31,51,0.18)", padding:4, maxHeight:220, overflowY:"auto" }}>
                    {LAW_FIRMS.map(f => (
                      <button key={f} type="button"
                        onMouseDown={e => { e.preventDefault(); setDraft({...draft, firm:f}); setFirmOpen(false); }}
                        style={{ width:"100%", textAlign:"left", padding:"10px 14px", background: draft.firm===f ? "var(--off-white)" : "transparent", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight: draft.firm===f ? 600 : 400, color:"var(--black)", display:"flex", alignItems:"center", gap:10 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--off-white)")}
                        onMouseLeave={e => (e.currentTarget.style.background = draft.firm===f ? "var(--off-white)" : "transparent")}>
                        {f}{draft.firm===f && <Ic d={IC.check} size={14} style={{ marginLeft:"auto" }}/>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </EditField>
          <EditField label="Role">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {roles.map(r => {
                const active = draft.role===r.id;
                return (
                  <button key={r.id} type="button" onClick={() => setDraft({...draft, role:r.id})} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background: active ? "var(--off-white)" : "#FFF", border:`2px solid ${active ? "var(--black)" : "var(--hair)"}`, borderRadius:12, cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 140ms" }}>
                    <div style={{ width:20, height:20, borderRadius:999, border:`2px solid ${active ? "var(--black)" : "var(--hair)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {active && <div style={{ width:10, height:10, borderRadius:999, background:"var(--black)" }}/>}
                    </div>
                    <div><div style={{ fontSize:14, fontWeight:600 }}>{r.label}</div><div style={{ fontSize:12, color:"var(--warm-grey)" }}>{r.desc}</div></div>
                  </button>
                );
              })}
            </div>
          </EditField>
        </Section>
      )}

      {/* Availability & coverage */}
      <Section title="Availability & coverage">
        <div style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:12, padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Working days</div>
            <div style={{ display:"flex", gap:6 }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setUser({...user, availability:{...user.availability, [d]:!user.availability[d]}})} style={{ width:44, height:44, borderRadius:10, border:`1.5px solid ${user.availability[d] ? "var(--black)" : "var(--hair)"}`, background: user.availability[d] ? "var(--black)" : "#FFF", color: user.availability[d] ? "var(--off-white)" : "var(--warm-grey)", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 140ms" }}>
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Coverage areas</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {AREAS.map(a => {
                const active = user.coverageAreas.includes(a);
                return (
                  <button key={a} onClick={() => { const next = active ? user.coverageAreas.filter(x=>x!==a) : [...user.coverageAreas, a]; setUser({...user, coverageAreas:next}); }} style={{ padding:"7px 14px", borderRadius:999, border:`1px solid ${active ? "var(--black)" : "var(--hair)"}`, background: active ? "var(--black)" : "#FFF", color: active ? "var(--off-white)" : "var(--black)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 140ms" }}>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Payment details */}
      <Section id="lk-settings-payment-details" title="Payment details">
        {!bankFormOpen ? (
          <div style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:12, padding:"16px 18px", display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background: bankDetails ? "var(--green-soft)" : "var(--pale-grey)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ic d={IC.credit} size={18} style={{ color: bankDetails ? "var(--green)" : "var(--black)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600 }}>{bankDetails ? bankDetails.bankName : "Not added yet"}</div>
                  {bankDetails && (
                    <div style={{ fontSize:13, color:"var(--warm-grey)", fontVariantNumeric:"tabular-nums" }}>
                      {bankDetails.accountNumber} · {bankDetails.accountHolderName}
                    </div>
                  )}
                </div>
              </div>
              <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={openBankForm}>
                <Ic d={IC.edit} size={14}/> {bankDetails ? "Update" : "Add now"}
              </button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"var(--pale-grey)", borderRadius:10 }}>
              <Ic d={IC.shield} size={14} style={{ color:"var(--warm-grey)", flexShrink:0 }}/>
              <span style={{ fontSize:12, color:"var(--warm-grey)", lineHeight:1.4 }}>Earnings are paid out via DuitNow within 3 business days of job completion.</span>
            </div>
          </div>
        ) : (
          <div style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:12, padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
            <EditField label="Account holder name">
              <input
                className="lk-input" value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                placeholder="Name on the bank account"
                style={{ borderRadius:12 }}
              />
            </EditField>
            <EditField label="Bank">
              <select
                className="lk-input" value={bankName}
                onChange={e => setBankName(e.target.value)}
                style={{ borderRadius:12 }}
              >
                <option value="" disabled>Select your bank</option>
                {MALAYSIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </EditField>
            <EditField label="Account number">
              <input
                className="lk-input" value={accountNumber} inputMode="numeric"
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="1234567890"
                style={{ borderRadius:12, fontVariantNumeric:"tabular-nums" }}
              />
            </EditField>
            {bankError && <p style={{ color:"var(--red)", fontSize:12.5, margin:0 }}>{bankError}</p>}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={() => setBankFormOpen(false)}>Cancel</button>
              <button className="lk-btn lk-btn--sm" disabled={bankSaving} onClick={saveBankDetails}>
                {bankSaving ? "Saving…" : <><Ic d={IC.check} size={14}/> Save</>}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <NotifToggle label="WhatsApp job alerts"    desc="New jobs matching your area and availability"    checked={user.notifications.whatsappAlerts}   onChange={v => setUser({...user, notifications:{...user.notifications, whatsappAlerts:v}})}/>
        <NotifToggle label="Job reminders"           desc="30-minute and 1-hour reminders before appointments" checked={user.notifications.jobReminders}  onChange={v => setUser({...user, notifications:{...user.notifications, jobReminders:v}})}/>
        <NotifToggle label="Payment confirmations"   desc="When a payment is made or received"             checked={user.notifications.paymentConfirm}   onChange={v => setUser({...user, notifications:{...user.notifications, paymentConfirm:v}})}/>
        <NotifToggle label="Weekly digest"           desc="Summary of your week&apos;s activity"           checked={user.notifications.weeklyDigest}     onChange={v => setUser({...user, notifications:{...user.notifications, weeklyDigest:v}})}/>
      </Section>

      {/* Security */}
      <Section title="Security">
        <ActionRow icon={IC.phone}  label="Change phone number"    desc="Verify with a new OTP"/>
        <ActionRow icon={IC.lock}   label="Active sessions"        desc="Manage where you're logged in"/>
        <ActionRow icon={IC.exit}   label="Sign out everywhere"    desc="Log out all devices" danger onClick={onSignOut}/>
      </Section>
    </div>
  );
}

/* ============================================================
   History tab
   ============================================================ */
function HistoryTab() {
  const jobs = INIT_HISTORY;
  const [filter, setFilter] = useState<HistFilter>("all");
  const filtered = filter === "all" ? jobs : jobs.filter(j => j.payment === filter);

  const totalEarned = jobs.filter(j => j.payment==="paid" && j.role==="picker").reduce((s,j) => s+j.fee, 0);
  const totalSpent  = jobs.filter(j => j.payment==="paid" && j.role==="poster").reduce((s,j) => s+j.fee, 0);
  const pendingAmt  = jobs.filter(j => j.payment!=="paid").reduce((s,j) => s+j.fee, 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        <StatCard label="Total earned" value={`RM ${totalEarned}`} accent="var(--green)"/>
        <StatCard label="Total spent"  value={`RM ${totalSpent}`}  accent="var(--black)"/>
        <StatCard label="Pending"      value={`RM ${pendingAmt}`}  accent="var(--amber)"/>
      </div>

      {/* Filter chips */}
      <div style={{ display:"flex", gap:8 }}>
        {(["all","paid","pending","overdue"] as const).map(k => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding:"7px 14px", borderRadius:999, border:`1px solid ${filter===k ? "var(--black)" : "var(--hair)"}`, background: filter===k ? "var(--black)" : "#FFF", color: filter===k ? "var(--off-white)" : "var(--black)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            {k==="all" ? "All" : k.charAt(0).toUpperCase()+k.slice(1)}
          </button>
        ))}
      </div>

      {/* Job list */}
      <div style={{ display:"flex", flexDirection:"column", gap:0, background:"#FFF", border:"1px solid var(--hair)", borderRadius:14, overflow:"hidden" }}>
        {filtered.length === 0 && <div style={{ padding:32, textAlign:"center", color:"var(--warm-grey)", fontSize:13 }}>No jobs match this filter.</div>}
        {filtered.map((j, idx) => (
          <div key={j.id} style={{ padding:"16px 20px", borderBottom: idx<filtered.length-1 ? "1px solid var(--pale-grey)" : "none", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:56, flexShrink:0, textAlign:"center" }}>
              <div style={{ fontSize:13, fontWeight:700, fontVariantNumeric:"tabular-nums" }}>{j.date}</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.01em", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.venue}</div>
              <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:2 }}>{j.docType} · {j.area}</div>
            </div>
            <span className={`lk-chip lk-chip--sm${j.role==="picker" ? " lk-chip--solid" : ""}`} style={{ fontSize:10 }}>
              {j.role==="poster" ? "Posted" : "Picked"}
            </span>
            <PaymentBadge status={j.payment}/>
            <div style={{ width:72, textAlign:"right", fontSize:16, fontWeight:700, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.01em" }}>RM {j.fee}</div>
            <Ic d={IC.chevR} size={16} style={{ color:"var(--warm-grey)", flexShrink:0 }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Billing tab — Poster → platform. Fee is RM0.00 today; the flow
   (select, pay, review, history, export) is the point, not the amount.
   ============================================================ */
interface FeeTxn {
  id: string; amount: number; status: "unpaid" | "paid";
  dueAt: string; createdAt: string; paymentId: string | null; isDueNow: boolean;
  job: { id: string; venue: string; docType: string; appointmentAt: string; area: string | null } | null;
}
interface BillingSummary { totalUnpaid: number; unpaidCount: number; thresholdExceeded: boolean; threshold: number }
interface PastPayment {
  id: string; method: string; totalAmount: number; reference: string | null;
  status: "pending" | "confirmed" | "rejected"; submittedAt: string; reviewedAt: string | null;
  transactions: { id: string; amount: number; venue: string | null; docType: string | null; appointmentAt: string | null }[];
}

function PaymentStatusBadge({ status }: { status: "pending" | "confirmed" | "rejected" }) {
  const map = {
    pending:   { label:"Pending review", bg:"var(--amber-soft)", fg:"#7A4A0F",    border:"var(--amber)" },
    confirmed: { label:"Confirmed",      bg:"var(--green-soft)", fg:"var(--green)", border:"var(--green)" },
    rejected:  { label:"Rejected",       bg:"var(--red-soft)",   fg:"var(--red)",   border:"var(--red)" },
  } as const;
  const s = map[status];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:s.bg, color:s.fg, border:`1px solid ${s.border}` }}>
      <span style={{ width:5, height:5, borderRadius:999, background:s.fg }}/>{s.label}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", { day:"numeric", month:"short", year:"numeric" });
}

function BillingTab({ token }: { token?: string }) {
  const [transactions, setTransactions] = useState<FeeTxn[]>([]);
  const [summary, setSummary]           = useState<BillingSummary | null>(null);
  const [payments, setPayments]         = useState<PastPayment[]>([]);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [submitting, setSubmitting]     = useState(false);
  const [toast, setToast]               = useState<string | null>(null);
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);

  const refresh = useCallback(() => {
    if (!token) { setLoading(false); return; }
    Promise.all([
      fetch("/api/billing/transactions", { headers:{ Authorization:`Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/billing/payments",     { headers:{ Authorization:`Bearer ${token}` } }).then(r => r.json()),
    ]).then(([t, p]) => {
      setTransactions(t.transactions ?? []);
      setSummary(t.summary ?? null);
      setPayments(p.payments ?? []);
      // Drop any selected id that's no longer payable (paid, gone, or just
      // submitted into a payment) rather than blindly clearing — a refresh
      // shouldn't silently discard what the poster's already ticked.
      const stillPayable = new Set<string>(
        (t.transactions ?? []).filter((x: FeeTxn) => x.status === "unpaid" && !x.paymentId).map((x: FeeTxn) => x.id)
      );
      setSelected(prev => new Set(Array.from(prev).filter(id => stillPayable.has(id))));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  // Selectable = unpaid AND not already sitting in a pending payment. Once
  // submitted, a transaction moves conceptually into "Payment history" —
  // showing it as payable again here would let the same fee get
  // double-submitted before the first attempt is even reviewed.
  const payable      = transactions.filter(t => t.status === "unpaid" && !t.paymentId);
  const awaitingReview = transactions.filter(t => t.status === "unpaid" && t.paymentId);
  const selectedTotal = transactions.filter(t => selected.has(t.id)).reduce((s,t) => s+t.amount, 0);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function submitPayment() {
    if (!token || selected.size === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/payments", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ transactionIds: Array.from(selected), method:"bank_transfer" }),
      });
      if (res.ok) {
        setToast("Payment submitted — we'll confirm once it's received.");
        refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setToast(body.error ?? "Failed to submit payment.");
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 3500);
    }
  }

  async function exportCsv() {
    if (!token) return;
    const res = await fetch("/api/billing/export", { headers:{ Authorization:`Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lawkaki-billing-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"var(--warm-grey)", fontSize:13 }}>Loading…</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <StatCard label="Outstanding balance" value={`RM ${summary?.totalUnpaid.toFixed(2) ?? "0.00"}`} accent={summary?.thresholdExceeded ? "var(--red)" : "var(--black)"}/>
        <StatCard label="Unpaid transactions" value={String(summary?.unpaidCount ?? 0)} accent="var(--black)"/>
      </div>

      {summary && summary.thresholdExceeded && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--red-soft)", border:"1px solid var(--red)", borderRadius:12 }}>
          <Ic d={IC.alert} size={18} style={{ color:"var(--red)", flexShrink:0 }}/>
          <span style={{ fontSize:13, fontWeight:600, color:"var(--red)" }}>
            Your outstanding balance is over RM {summary.threshold.toFixed(2)} — all unpaid transactions below are due now, regardless of their individual due date.
          </span>
        </div>
      )}

      {/* Transactions to pay */}
      <Section title="Transactions">
        {payable.length === 0 && awaitingReview.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--warm-grey)", fontSize:13, background:"#FFF", border:"1px solid var(--hair)", borderRadius:14 }}>
            Nothing outstanding. You&apos;re all paid up.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {payable.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:0, background:"#FFF", border:"1px solid var(--hair)", borderRadius:14, overflow:"hidden" }}>
                {payable.map((t, idx) => (
                  <label key={t.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderBottom: idx<payable.length-1 ? "1px solid var(--pale-grey)" : "none", cursor:"pointer" }}>
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} style={{ width:16, height:16, flexShrink:0, accentColor:"var(--black)" }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.01em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.job?.venue ?? "Job removed"}</div>
                      <div style={{ fontSize:12, color:"var(--warm-grey)", marginTop:2 }}>{t.job?.docType} · Due {fmtDate(t.dueAt)}</div>
                    </div>
                    <PaymentBadge status={t.isDueNow ? "overdue" : "pending"}/>
                    <div style={{ width:80, textAlign:"right", fontSize:15, fontWeight:700, fontVariantNumeric:"tabular-nums" }}>RM {t.amount.toFixed(2)}</div>
                  </label>
                ))}
              </div>
            )}
            {awaitingReview.length > 0 && (
              <div style={{ fontSize:12, color:"var(--warm-grey)", padding:"0 4px" }}>
                {awaitingReview.length} more awaiting confirmation — see Payment history below.
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Pay selected */}
      {payable.length > 0 && (
        <Section title="Pay">
          <div style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"var(--warm-grey)" }}>Selected total</span>
              <span style={{ fontSize:24, fontWeight:800, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>RM {selectedTotal.toFixed(2)}</span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--warm-grey)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Payment method</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", border:"2px solid var(--black)", borderRadius:10 }}>
                <Ic d={IC.credit} size={16}/>
                <span style={{ fontSize:13, fontWeight:600, flex:1 }}>Bank transfer</span>
                <Ic d={IC.check} size={14}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", border:"1px solid var(--hair)", borderRadius:10, opacity:0.5 }}>
                <Ic d={IC.credit} size={16}/>
                <span style={{ fontSize:13, fontWeight:600, flex:1 }}>Payment gateway</span>
                <span style={{ fontSize:11, fontWeight:700, color:"var(--warm-grey)", textTransform:"uppercase", letterSpacing:"0.04em" }}>Coming soon</span>
              </div>
            </div>

            <div style={{ padding:"12px 14px", background:"var(--pale-grey)", borderRadius:10, display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--warm-grey)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Transfer to</div>
              <div style={{ fontSize:13, fontWeight:600 }}>{PLATFORM_BANK.bankName} · {PLATFORM_BANK.accountName}</div>
              <div style={{ fontSize:13, fontVariantNumeric:"tabular-nums", color:"var(--warm-grey)" }}>{PLATFORM_BANK.accountNumber}</div>
              <div style={{ fontSize:11.5, color:"var(--warm-grey)", marginTop:4 }}>{PLATFORM_BANK.reference}</div>
            </div>

            <button
              className="lk-btn lk-btn--accent"
              disabled={selected.size === 0 || submitting}
              onClick={submitPayment}
              style={{ width:"100%" }}
            >
              {submitting ? "Submitting…" : `I've made this payment — RM ${selectedTotal.toFixed(2)}`}
            </button>
            {toast && <div style={{ fontSize:12.5, color:"var(--warm-grey)", textAlign:"center" }}>{toast}</div>}
          </div>
        </Section>
      )}

      {/* Payment history */}
      <Section
        title="Payment history"
        action={payments.length > 0 ? (
          <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={exportCsv}>
            <Ic d={IC.download} size={14}/> Export CSV
          </button>
        ) : undefined}
      >
        {payments.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:"var(--warm-grey)", fontSize:13, background:"#FFF", border:"1px solid var(--hair)", borderRadius:14 }}>
            No payments made yet.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {payments.map(p => {
              const isOpen = expanded === p.id;
              return (
                <div key={p.id} style={{ background:"#FFF", border:"1px solid var(--hair)", borderRadius:14, overflow:"hidden" }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}
                  >
                    <Ic d={isOpen ? IC.chevD : IC.chevR} size={14} style={{ color:"var(--warm-grey)", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:700 }}>{fmtDate(p.submittedAt)}</div>
                      <div style={{ fontSize:11.5, color:"var(--warm-grey)", marginTop:2 }}>{p.transactions.length} case{p.transactions.length!==1?"s":""} · Bank transfer</div>
                    </div>
                    <PaymentStatusBadge status={p.status}/>
                    <div style={{ width:80, textAlign:"right", fontSize:15, fontWeight:700, fontVariantNumeric:"tabular-nums" }}>RM {p.totalAmount.toFixed(2)}</div>
                  </button>
                  {isOpen && (
                    <div style={{ borderTop:"1px solid var(--pale-grey)" }}>
                      {p.transactions.map((t, idx) => (
                        <div key={t.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 18px 10px 46px", borderBottom: idx<p.transactions.length-1 ? "1px solid var(--pale-grey)" : "none" }}>
                          <div style={{ flex:1, minWidth:0, fontSize:12.5 }}>
                            {t.venue ?? "Job removed"} <span style={{ color:"var(--warm-grey)" }}>· {t.docType}</span>
                          </div>
                          <div style={{ fontSize:12.5, fontVariantNumeric:"tabular-nums", fontWeight:600 }}>RM {t.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ============================================================
   Layout
   ============================================================ */
function SettingsNav({ onBack, initials, isMobile = false }: { onBack?: () => void; initials: string; isMobile?: boolean }) {
  return (
    <header style={{
      height: 64, background:"#FFF", borderBottom:"1px solid var(--hair)", display:"flex", alignItems:"center",
      padding: isMobile ? "0 12px" : "0 24px", gap: isMobile ? 10 : 20, flexShrink:0,
      position:"sticky", top:0, zIndex:30,
    }}>
      <a href="/" style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, textDecoration:"none", flexShrink:0 }}>
        <svg width="32" height="40" viewBox="0 0 80 100" fill="none">
          <path d="M40 4 C 60.4 4 76 19.6 76 40 C 76 53.6 67.5 66 56 76 L 40 96 L 24 76 C 12.5 66 4 53.6 4 40 C 4 19.6 19.6 4 40 4 Z" fill="#0F1F33"/>
        </svg>
        <div>
          <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.1, color:"var(--black)" }}>Law Kaki</div>
          {!isMobile && (
            <div style={{ fontSize:11, color:"var(--warm-grey)", fontWeight:500 }}>Your best legal kaki on the ground.</div>
          )}
        </div>
      </a>
      <div style={{ flex:1 }}/>
      <button
        onClick={onBack}
        aria-label="Back to dashboard"
        title="Back to dashboard"
        style={{
          display:"inline-flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"var(--warm-grey)",
          background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit",
          padding: isMobile ? 8 : "8px 14px", borderRadius:999,
        }}
      >
        <Ic d={IC.arrowL} size={16}/> {!isMobile && "Back to dashboard"}
      </button>
      <div className="lk-avatar" style={{ background:"var(--black)", color:"var(--off-white)", width:36, height:36, fontSize:13, flexShrink:0 }}>{initials}</div>
    </header>
  );
}

function SettingsSidebar({ active, onChange, isMobile = false }: { active: SettingsTab; onChange: (t: SettingsTab) => void; isMobile?: boolean }) {
  if (isMobile) {
    return (
      <nav style={{
        display:"flex", gap:6, padding:"10px 12px", borderBottom:"1px solid var(--hair)",
        background:"#FFF", overflowX:"auto", flexShrink:0, position:"sticky", top:64, zIndex:20,
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display:"flex", alignItems:"center", gap:8, padding:"8px 14px", whiteSpace:"nowrap",
            background: active===tab.id ? "var(--black)" : "transparent",
            border:`1px solid ${active===tab.id ? "var(--black)" : "var(--hair)"}`,
            borderRadius:999, cursor:"pointer", fontFamily:"inherit", fontSize:13,
            fontWeight: active===tab.id ? 700 : 500,
            color: active===tab.id ? "var(--off-white)" : "var(--warm-grey)",
            flexShrink:0,
          }}>
            <Ic d={tab.icon} size={16}/>{tab.label}
          </button>
        ))}
      </nav>
    );
  }
  return (
    <nav style={{ width:240, flexShrink:0, padding:"20px 12px", borderRight:"1px solid var(--hair)", background:"#FFF", display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ fontSize:11, color:"var(--warm-grey)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"8px 12px", marginBottom:4 }}>Settings</div>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background: active===tab.id ? "var(--off-white)" : "transparent", border:"none", borderRadius:10, cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"inherit", fontSize:14, fontWeight: active===tab.id ? 700 : 500, color: active===tab.id ? "var(--black)" : "var(--warm-grey)", transition:"background 140ms, color 140ms" }}
          onMouseEnter={e => { if (active!==tab.id) e.currentTarget.style.background="var(--off-white)"; }}
          onMouseLeave={e => { if (active!==tab.id) e.currentTarget.style.background="transparent"; }}>
          <Ic d={tab.icon} size={18}/>{tab.label}
        </button>
      ))}
    </nav>
  );
}

/* ============================================================
   Root export
   ============================================================ */
interface SettingsProps {
  onClose?: () => void;
  onSignOut?: () => void;
  userName?: string;
  userPhone?: string;
  onNameChange?: (n: string) => void;
  token?: string;
  bankDetails?: BankDetails | null;
  onBankDetailsSaved?: (d: BankDetails) => void;
  initialTab?: SettingsTab;
  focusPayment?: boolean;
}
function initialsFrom(name: string): string {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function Settings({ onClose, onSignOut, token, userName, userPhone, bankDetails, onBankDetailsSaved, initialTab, focusPayment }: SettingsProps) {
  const [tab, setTab]   = useState<SettingsTab>(initialTab ?? "profile");
  const isMobile = useIsMobile();
  // The rest of this profile (rating, job count, availability, etc.) is
  // still mock data — see docs/PRD.md — but name/phone are real, since the
  // bank details form below uses the real name as the account holder
  // name's default (editable — any account holder is allowed).
  const [user, setUser] = useState<User>(() => ({
    ...INIT_USER,
    ...(userName  ? { name: userName, initials: initialsFrom(userName) } : {}),
    ...(userPhone ? { phone: userPhone } : {}),
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"var(--off-white)" }}>
      <SettingsNav onBack={onClose} initials={user.initials} isMobile={isMobile}/>
      <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", flex:1, minHeight:0 }}>
        <SettingsSidebar active={tab} onChange={setTab} isMobile={isMobile}/>
        <main className="lk-scroll" style={{ flex:1, minHeight:0, overflowY:"auto", padding: isMobile ? "20px 16px 40px" : "28px 40px 80px" }}>
          <div style={{ maxWidth:720 }}>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight:700, letterSpacing:"-0.025em", margin:"0 0 4px" }}>
                {TABS.find(t => t.id===tab)?.label}
              </h1>
              <p style={{ fontSize:14, color:"var(--warm-grey)", margin:0 }}>{TAB_SUBS[tab]}</p>
            </div>
            {tab==="profile"  && (
              <ProfileTab
                user={user} setUser={setUser} onSignOut={onSignOut}
                token={token} bankDetails={bankDetails} onBankDetailsSaved={onBankDetailsSaved}
                focusPayment={focusPayment} isMobile={isMobile}
              />
            )}
            {tab==="history"  && <HistoryTab/>}
            {tab==="billing"  && <BillingTab token={token}/>}
          </div>
        </main>
      </div>
    </div>
  );
}
