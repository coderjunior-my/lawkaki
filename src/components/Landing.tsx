"use client";

import { CSSProperties } from "react";
import LandingFAQ from "@/components/LandingFAQ";
import { siteName } from "@/lib/seo";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Conveyancing signing job dispatch",
  provider: { "@type": "Organization", name: siteName },
  areaServed: "MY",
  audience: { "@type": "Audience", audienceType: "Law firms and lawyers" },
};

/* ============================================================
   Icons — Lucide-style inline SVGs (local copy; each top-level
   component in this app keeps its own small icon set)
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
  briefcase: ["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z", "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"],
  mapPin:    ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"],
  check:     "M20 6 9 17l-5-5",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

/* ============================================================
   Brand pin path — shared teardrop shape (matches the logo mark
   used across LoginFlow/Settings/Dashboard)
   ============================================================ */
const PIN_PATH = "M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z";

/* ============================================================
   Hero illustration — on-brand duotone (black + amber) scene.
   No external image: a minimal skyline, a dashed route between a
   "picker" pin (the brand mark) and an "open job" pin, echoing the
   real dashboard's map-pin convention (black = taken, amber = open)
   plus a WhatsApp-style notification hint. Exactly one amber
   element, per the brand's "never more than one accent" rule.
   ============================================================ */
function HeroIllustration() {
  return (
    <svg width={280} height={190} viewBox="0 0 280 190" fill="none" aria-hidden style={{ marginBottom: 4 }}>
      {/* Skyline */}
      <rect x="6"   y="146" width="26" height="44" rx="2" fill="var(--pale-grey)" />
      <rect x="36"  y="126" width="22" height="64" rx="2" fill="var(--hair)" />
      <rect x="62"  y="140" width="20" height="50" rx="2" fill="var(--pale-grey)" />
      <rect x="196" y="132" width="24" height="58" rx="2" fill="var(--pale-grey)" />
      <rect x="224" y="150" width="22" height="40" rx="2" fill="var(--hair)" />
      <rect x="250" y="138" width="24" height="52" rx="2" fill="var(--pale-grey)" />

      {/* Route between the two pins */}
      <path
        d="M60 100 Q 130 28 190 66"
        stroke="var(--warm-grey)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" fill="none"
      />

      {/* Picker pin — the brand mark itself */}
      <g transform="translate(40, 78) scale(0.62) translate(-40, -50)">
        <path d={PIN_PATH} fill="var(--black)" />
      </g>

      {/* Open job pin — the one deliberate amber element */}
      <g transform="translate(196, 46) scale(0.5) translate(-40, -50)">
        <path d={PIN_PATH} fill="var(--amber)" />
        <circle cx="40" cy="40" r="12" fill="var(--off-white)" />
      </g>

      {/* WhatsApp-style notification hint */}
      <g transform="translate(220, 14)">
        <rect x="0" y="0" width="42" height="27" rx="8" fill="var(--off-white)" stroke="var(--black)" strokeWidth="2" />
        <path d="M9 27 L9 35 L19 27 Z" fill="var(--off-white)" stroke="var(--black)" strokeWidth="2" strokeLinejoin="round" />
        <line x1="10" y1="9"  x2="33" y2="9"  stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="17" x2="25" y2="17" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ============================================================
   Coverage map — the real Malaysia outline (base map: Wikimedia
   Commons, "Blank malaysia map.svg" by Exiang, CC BY 3.0; recoloured
   to the brand palette, served as a static asset at
   /public/malaysia-map.svg since it's ~50KB of path data — no need
   to bloat the JS bundle for a static image). Amber dots are laid
   over it as a separate lightweight inline SVG so they stay
   React-controlled and CSS-var themed, positioned at real bounding-box
   centroids of six states/territories (measured from the source
   file) spread coast to coast and peninsula to Borneo — not
   guessed coordinates.
   ============================================================ */
const COVERAGE_DOTS: { cx: number; cy: number }[] = [
  { cx: 49,  cy: 64 },  // northern peninsula
  { cx: 95,  cy: 161 }, // west coast
  { cx: 114, cy: 250 }, // Selangor / KL area
  { cx: 228, cy: 317 }, // southern peninsula
  { cx: 519, cy: 268 }, // Sarawak
  { cx: 789, cy: 106 }, // Sabah
];

function CoverageMap() {
  return (
    <div style={{ width: "100%", marginBottom: 36 }}>
      <div style={{ position: "relative", width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/malaysia-map.svg"
          alt="Map of Malaysia showing Law Kaki coverage across every state"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        <svg
          viewBox="0 0 915 400"
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {COVERAGE_DOTS.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={9} fill="var(--amber)" stroke="var(--off-white)" strokeWidth={3} />
          ))}
        </svg>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "var(--warm-grey)", marginTop: 8 }}>
        Base map: Wikimedia Commons (Exiang), CC BY 3.0 — recoloured.
      </p>
    </div>
  );
}

const STEPS: { icon: string | string[]; title: string; body: string }[] = [
  { icon: I.briefcase, title: "Post a job",     body: "Can't make a signing? Share the venue, time, and indicative fee in a minute." },
  { icon: I.mapPin,    title: "Get picked up",  body: "Nearby kakis get a WhatsApp alert and put their hand up if they're free." },
  { icon: I.check,     title: "Confirm & go",   body: "Pick your kaki, both of you get each other's contact, reminders fire before the appointment." },
  { icon: I.star,      title: "Rate & done",    body: "Mark it complete and rate on punctuality, professionalism, and completeness." },
];

const BENEFITS: { icon: string | string[]; audience: string; items: string[] }[] = [
  {
    icon: I.briefcase,
    audience: "For Law Firms",
    items: [
      "Delegate a signing you can't make in under a minute",
      "Reach every available kaki nearby, instantly",
      "Rate and build trust in your firm's bench",
    ],
  },
  {
    icon: I.mapPin,
    audience: "For Lawyers",
    items: [
      "Fill gaps in your day with jobs nearby",
      "Earn an indicative fee for appointments you pick up",
      "Build a rating that gets you picked for more work",
    ],
  },
];

export default function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "var(--off-white)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 20px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <HeroIllustration />

          <h1
            style={{
              fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em",
              textAlign: "center", marginTop: 12, marginBottom: 10, lineHeight: 1.15,
            }}
          >
            Your best legal kaki on the ground.
          </h1>
          <p
            style={{
              textAlign: "center", color: "var(--warm-grey)", fontSize: 15,
              marginBottom: 32, maxWidth: 380, lineHeight: 1.6,
            }}
          >
            Signings happen at the client&apos;s time, not yours. Post the appointment you can&apos;t
            make, a trusted colleague picks it up nearby — no more burning the afternoon in traffic.
          </p>

          {/* Benefits — split by audience, since most lawyers are both at different times */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, width: "100%", marginBottom: 36 }}>
            {BENEFITS.map((b) => (
              <div
                key={b.audience}
                style={{
                  flex: "1 1 220px", minWidth: 220,
                  background: "#FFFFFF", border: "1px solid var(--hair)", borderRadius: 16,
                  padding: "18px 20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: "var(--black)", color: "var(--off-white)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon d={b.icon} size={15} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>{b.audience}</h3>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {b.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--warm-grey)", lineHeight: 1.5 }}>
                      <span style={{ marginTop: 6, width: 4, height: 4, borderRadius: 999, background: "var(--black)", flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Nationwide coverage */}
          <h2
            style={{
              fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em",
              textAlign: "center", marginBottom: 8, lineHeight: 1.25,
            }}
          >
            Now covering the whole of Malaysia.
          </h2>
          <p
            style={{
              textAlign: "center", color: "var(--warm-grey)", fontSize: 14,
              marginBottom: 20, maxWidth: 380, lineHeight: 1.6,
            }}
          >
            Firms in every state, from Perlis to Sabah. Move city and the jobs move with you —
            pick up work wherever you land, not just where your firm is based.
          </p>
          <CoverageMap />

          {/* How it works */}
          <h2
            style={{
              fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em",
              textAlign: "center", marginTop: 0, marginBottom: 16, lineHeight: 1.25,
            }}
          >
            How it works
          </h2>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, marginBottom: 40 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16,
                  padding: "16px 4px",
                  borderBottom: i < STEPS.length - 1 ? "1px solid var(--hair)" : "none",
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "var(--black)", color: "var(--off-white)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon d={s.icon} size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>
                    {s.title}
                  </h3>
                  <div style={{ fontSize: 13.5, color: "var(--warm-grey)", lineHeight: 1.5 }}>
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onGetStarted}
            className="lk-btn lk-btn--accent lk-btn--lg"
            style={{ width: "100%", height: 52, fontSize: 15 }}
          >
            Get started <Icon d={I.arrowR} size={18} />
          </button>
          <p style={{ textAlign: "center", color: "var(--warm-grey)", fontSize: 12.5, marginTop: 14 }}>
            Sign in with your mobile number via WhatsApp.
          </p>

          <LandingFAQ />
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* Footer — matches the auth flow's footer */}
      <div
        style={{
          padding: "14px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 20,
          fontSize: 12,
          color: "var(--warm-grey)",
          fontWeight: 500,
          borderTop: "1px solid var(--hair)",
        }}
      >
        <span>© 2026 Law Kaki</span>
        {/* Privacy/Terms links removed until real pages exist — a dead
            href="#" on an indexed page is worse than no link at all. */}
      </div>
    </div>
  );
}
