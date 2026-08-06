# CLAUDE.md — Law Kaki

> Context file for Claude when working on the Law Kaki project. Read this first before any design, code, or product task.

---

## What This Project Is

**Law Kaki** is a job dispatch web application for conveyancing lawyers. Lawyers post signing appointments they can't attend. Colleagues pick them up. The platform handles discovery, confirmation, reminders, and ratings.

**Tagline:** *Your best legal kaki on the ground.*

**Pilot scope (as originally designed):** One law firm. Kuala Lumpur and Selangor only. No other Malaysian states. **This is not what's currently built** — see the note below.

---

## Read This Before Trusting Anything Else in This File

This file is the **product vision and brand bible** — phasing, tone, palette, the shape the product is supposed to take. It is not a live account of the codebase, and several sections below describe the original Phase 1 intent rather than current behaviour. For what's actually shipped, **`docs/PRD.md` is the living document** — it's dated and updated against the real code, and where it disagrees with this file, trust the PRD.

The biggest divergences, as of the current branch:

- **Registration is open and nationwide, not admin-gated to one firm.** `POST /api/auth/register` auto-approves every signup (`status: "active"`, `verified: true`); the firm picker (`src/lib/lawFirms.ts`) lists 119 firms across all 13 states + 3 federal territories, and `GET /api/jobs` has no firm filter. The `AdminApproval` type and the "Admin controls who's on the platform" framing below describe intent, not what runs today. The one exception — a real `/admin` console exists, but it only reviews platform-fee payments (see next point); admin accounts are provisioned by flipping `users.is_admin` directly, not through any UI.
- **There is no map API, routing, or conflict detection.** The "map dashboard" is a static, hand-drawn SVG of KL/Selangor with pins placed by hardcoded x/y coordinates — not Google Maps, not real geodata. `distance`/`duration` fields exist on the job type but aren't computed from anything. Step 4 of the Core Product Loop below ("System checks route feasibility → flags time conflicts") isn't implemented.
- **Platform billing infrastructure exists**, even though the "no money flow in Phase 1" principle still holds in spirit. Posters can add bank details, `fee_transactions` accrue per completed job, and the `/admin` console confirms/rejects submitted payments — but the listing fee (`PLATFORM_FEE_RM`) is hardcoded to `0`, so nothing is actually charged. The mechanism is live; the monetisation switch is just off. See **Payment Handling** below.
- **Settings is mid-migration** from a disconnected mock-data prototype to one wired to real endpoints. Billing and Contact tabs now hit real APIs; Profile and History are still partially or fully mock.

None of this is licence to keep building Phase-2-shaped features — flag new gaps the way these were flagged (in the PRD), rather than letting drift go undocumented.

---

## What "Kaki" Means

A Malay word with two meanings used simultaneously:
- **Legs** — movement, being on the ground, doing the travelling
- **Buddy** — a trusted person in your circle, your guy

The name should always be written as **Law Kaki** — two words, both capitalised. Never *LawKaki*, *lawkaki*, or *LAW KAKI*.

---

## The Problem in One Paragraph

Malaysian conveyancing lawyers must be physically present when clients sign documents (Sale and Purchase Agreements, loan docs, Memoranda of Transfer). Appointments happen at the client's location and time, not the lawyer's. A typical afternoon — Ara Damansara 2pm, Mont Kiara 4pm, Bangsar 6pm — burns the entire day in KL traffic for minimal legal work. Delegation already happens informally. Law Kaki structures it.

---

## Users

| Role | Description |
|---|---|
| **Poster** | A lawyer who has a signing appointment they want to delegate |
| **Picker** | A lawyer who picks up jobs near them for an indicative commission |
| **Admin** | *Designed to be* the managing partner or ops manager controlling who's on the platform. **Not built** — registration is currently self-serve and auto-approved for anyone. The one thing an admin account does today is review platform-fee payments at `/admin`. |

One lawyer is usually both Poster and Picker at different times.

---

## Core Product Loop

1. Poster opens WhatsApp link → posts a job (address, time, doc type, indicative commission, notes)
2. All eligible Pickers get a WhatsApp notification (and an in-app one — the bell icon in `Dashboard.tsx`)
3. Picker opens the map dashboard → sees pins → expresses interest on one or more jobs
4. ~~System checks route feasibility → flags time conflicts~~ — **not built.** No routing engine, no conflict detection; this is aspirational.
5. Poster confirms a picker (web, or WhatsApp reply `CONFIRM <code>`) → other pending interests on the job auto-decline, both parties see each other's contact
6. WhatsApp reminders fire 2hrs and 30mins before each appointment (in-app notification too)
7. After the appointment, Poster marks the job Complete and rates the Picker (and the Picker rates the Poster back — ratings are bidirectional, not one-way)

---

## Phases (Important — Don't Conflate Them)

### Phase 1 — Internal Firm Pilot (as designed — see the divergence note above for what's actually running)
- Single firm, KL/Selangor only
- Admin-controlled onboarding — no Bar Council verification
- **No real money movement** — commission is indicative, firm settles internally
- Goal: validate the UX loop
- Duration: 3 to 6 months

### Phase 2 — Open Marketplace (future)
- Multiple firms in KL/Selangor
- Bar Council roll number verification + practising certificate upload
- Real commission flow via escrow (Billplz or Curlec, FPX)
- Trigger: Phase 1 NPS above threshold + clear external demand

### Phase 3 — Platform Maturity (future)
- Scale within Malaysia, but still no state expansion beyond KL/Selangor until validated
- Traffic-aware routing, analytics, case management system integrations
- Full hybrid monetisation, possibly subscription tier for high-volume firms

**Everything we build now is Phase 1. Don't accidentally design for Phase 2.**

---

## Brand & Voice

### Personality
- **Grounded** — no startup fluff
- **Local** — unmistakably Malaysian
- **Efficient** — respects the user's time
- **Collegial** — warm without being casual

### Tone Examples
| Context | Example |
|---|---|
| Onboarding | *"Hi Kaki, you're in. Let's get started."* |
| Job alert | *"New job in Mont Kiara. RM150. 3pm Friday."* |
| Conflict alert | *"Heads up — this gap might be tight in KL traffic."* |
| Reminder | *"30 mins to go. Your kaki is on the way."* |
| Rating prompt | *"How did it go? Tap to rate."* |

### Always Avoid
Legal jargon, corporate stiffness, over-explanation, exclamation marks used for enthusiasm, and anything that reads like it was translated from English to Malay or vice versa.

### Light Malay Is Welcome
In conversational touchpoints (WhatsApp messages, empty states, confirmations). *"Terima kasih, kaki!"* works. Keep the UI itself in English for clarity — no bilingual interface.

---

## Visual Identity — Black, White, and a Hint

Law Kaki is primarily a **black and white product**. Restraint is intentional. Colour is used sparingly and only when it means something.

### Palette

| Role | Colour | Hex | Usage |
|---|---|---|---|
| Primary | True Black | `#0D0D0D` | Headings, key UI elements, logo |
| Surface | Off-White | `#F5F5F3` | Page backgrounds, cards |
| Mid | Warm Grey | `#8A8A8A` | Secondary text, borders, inactive states |
| Light | Pale Grey | `#E8E8E6` | Dividers, subtle surfaces |
| Accent | Amber | `#F5A623` | The one colour that earns its place. CTAs, conflict alerts, active job pins, unread notifications. **Never decorative.** |
| Error | Deep Red | `#B91C1C` | Cancellations and critical errors only |

### The Rule on Colour
If it can be communicated in black and white, do so. Amber appears only to draw attention to the single most important action or alert on a screen. **Never more than one amber element visible at a time.**

### Typography
- **Family:** Inter or Plus Jakarta Sans (clean sans-serif)
- **Hierarchy through weight, not colour** — bold/regular/light do what colour would elsewhere
- **Numbers:** tabular figures enabled (commission amounts and times must align cleanly)

### Iconography
- Outlined only — never filled, never mixed
- 2px stroke weight, consistent throughout
- Lucide or Phosphor icon sets
- Icons support labels, never replace them
- Always black or warm grey — never amber unless it's the primary action indicator

### Map Styling
**Non-negotiable: greyscale Google Maps style.** A full-colour map breaks the black and white discipline of the UI. Job pins:
- **Black** for taken or completed jobs
- **Amber** for open or urgent jobs

This makes available work visible at a glance.

**Current build note:** there is no Google Maps integration yet. The dashboard map is a static, hand-illustrated SVG of KL/Selangor (`Dashboard.tsx`) with pins placed at hardcoded coordinates — greyscale in spirit, real geodata not wired up. The pin colour rule above is already honoured in the SVG version; don't add a live map without checking whether that's actually in scope.

### Spacing
Generous whitespace. The monochrome palette means breathing room separates sections — not colour blocks.

---

## Rating System

Three dimensions, 1–5 stars each. **Built as bidirectional** — the Poster rates the Picker and the Picker rates the Poster (`ratings.rater_role`), not one-way as originally scoped:

| Dimension | Question |
|---|---|
| Punctuality | Did they arrive on time? |
| Professionalism | Did they represent the firm well? |
| Completeness | Were all documents handled correctly? |

**Rules:**
- Unlocked only after job marked Complete
- Public to all firm members
- Minimum 3 completed jobs before score is displayed (cold start protection) — enforced server-side via the `picker_ratings` / `poster_ratings` views
- Milestone badges at 1, 5, and 10 jobs — **not built.** Nothing in the codebase implements this yet; treat it as a backlog item, not a shipped feature.

---

## Monetisation (Phase 2+, Not Pilot)

- **Recommended:** Hybrid — small listing fee from Poster (RM3–5) + success fee from Picker (8–10% of commission)
- **Launch strategy:** Waive all fees for the first 6 months of public launch
- **Phase 1 pilot:** No fees at all, no money flow through platform, *in principle*. In practice, the listing-fee plumbing (bank details, `fee_transactions`, admin payment review — see Payment Handling below) has already been built with the fee set to `0`. That's the infrastructure for turning this section on, sitting dormant, not a rollout of it — don't read its existence as permission to set a nonzero fee without a product decision.

---

## Payment Handling

- **Picker commission** (the RM amount on a job posting): still no platform mediation. Direct transfer between lawyers, settled internally by the firm.
- **Platform listing fee — infrastructure is live, the fee itself is not.** Posters submit bank details (`POST /api/users/bank-details`), a `fee_transactions` row is created per completed job, a due-date/balance-threshold system tracks what's owed (`src/lib/billing.ts`), and admins confirm/reject submitted payments at `/admin`. `PLATFORM_FEE_RM` is hardcoded to `0`, so nothing is actually charged today — but the plumbing (bank details, transactions, admin review) is real and already shipped, ahead of where the original Phase 1/2 split put it. Don't raise `PLATFORM_FEE_RM` above `0` without an explicit product decision — that's the switch that turns monetisation on.
- **Phase 2:** Escrow via Billplz or Curlec (FPX-enabled), for the *commission* itself (the platform fee already has its own bank-transfer-based flow above). May require money services licence at volume — consult fintech lawyer before launch.
- **Not using:** Stripe Connect (limited Malaysia payout support).

---

## Tech Stack

These choices have since been made; the table reflects what's actually running, not the original either/or options.

| Layer | Tool |
|---|---|
| WhatsApp Interface | Twilio WhatsApp API — falls back to `console.log` when credentials are absent, so local dev never needs real creds |
| Frontend | Next.js (App Router), React, inline-styled components — no CSS framework beyond a Tailwind base + hand-rolled tokens in `globals.css` |
| Backend | Next.js API routes (no separate Node/FastAPI service) |
| Database | PostgreSQL via Supabase (service-role key server-side, RLS bypassed — not client-side Supabase auth) |
| Maps | **Not integrated.** No Google Maps Platform calls; the dashboard map is a static illustrated SVG. See "Map Styling" above. |
| Map Style | Greyscale-in-spirit, hand-drawn SVG today rather than a styled Google Maps layer |
| Auth | WhatsApp OTP → bearer session token stored server-side (`sessions` table), **not JWT** |
| Payments (Phase 1) | No commission payments; platform-fee *infrastructure* exists but the fee is `0` — see Payment Handling above |
| Payments (Phase 2) | Billplz or Curlec (not yet started) |
| Cron | Supabase `pg_cron` + `pg_net` calling `/api/cron/sweep` (hourly — interest reminders/expiry, idle-job expiry) and `/api/cron/reminders` (every 5 min — appointment reminders) |
| Analytics | Vercel Analytics |
| Hosting | Vercel (given the Next.js App Router + Vercel Analytics choice — confirm before assuming AWS/Railway) |

---

## Known Weak Spots (Don't Forget These)

These are the gaps we've already identified. If a design or code decision touches one of these, flag it.

1. **Document handoff is unsolved.** How does the original SPA get from Poster to Picker physically? Not yet designed.
2. **Client experience is an afterthought.** The client meets a different lawyer than they retained. No feature addresses their communication or comfort.
3. **Rating cold start.** New lawyers have no rating, get fewer jobs, can't build a rating. Loop not yet broken.
4. **WhatsApp single point of failure — partially mitigated.** Every notification-worthy event is *meant* to write an in-app row to the `notifications` table regardless of WhatsApp delivery, but several event types still don't: interest-expressed, interest-reminder, confirmation, job-cancelled, job-completed, review-submitted are WhatsApp-only today. A lawyer with WhatsApp trouble misses those silently.
5. **There's no conflict alert at all**, reactive or otherwise — no routing/conflict detection has been built (see the divergence note at the top of this file). Don't assume this exists when designing new features that reference it.
6. **No quality floor for Pickers.** A 2-star Picker is still on the platform. No suspension threshold, no appeals workflow.
7. **No admin approval gate.** Registration is fully self-serve and auto-approved; the `AdminApproval` type exists in `types.ts` but is unused. Anyone with a Malaysian WhatsApp number can register as any of the 119 listed firms today.
8. **No firm-level data isolation.** `GET /api/jobs` has no firm filter — any registered user sees and can pick up any open job at any firm, nationwide. Flagged as a deliberate current-state documentation choice in `docs/PRD.md`, not an oversight, but worth re-confirming before committing to a specific firm's pilot.

---

## High-Priority Open Points

Items requiring decisions before or during build. Full list in the Product Brief.

| # | Area | Open Point |
|---|---|---|
| 1 | Legal | Bar Council opinion on fee-splitting and sub-delegation (before Phase 2) |
| 2 | Client Consent | One-tap WhatsApp template for Posters to notify clients |
| 3 | Document Handoff | Define physical doc transfer workflow |
| 4 | No-Show Policy | Cancellation window, penalty, backup mechanism |
| 5 | Liability | Who is liable for Picker errors? Reflect in T&Cs |
| 6 | PDPA Compliance | Privacy policy + data handling for Malaysia PDPA |

---

## Going Public — Domain & Launch Checklist

Everything below is currently running in a dev/pilot-internal state (mock OTP, sandbox WhatsApp, no custom domain). This is the checklist for the moment there's a real domain and the site opens up for actual lawyers to use. Work through it roughly top to bottom — later items depend on earlier ones (Twilio's webhook needs a public URL; the cron SQL needs both a public URL and a real `CRON_SECRET`).

### 1. Domain & hosting
- Add the custom domain in the Vercel project settings and point DNS at it.
- Set `NEXT_PUBLIC_SITE_URL` in production env vars to the real domain (`https://lawkaki.com.my` or whatever it ends up being). Without this, `src/lib/seo.ts` falls back to `VERCEL_PROJECT_PRODUCTION_URL` or the hardcoded `lawkaki.vercel.app` placeholder — which then leaks into `robots.ts`, `sitemap.ts`, and OG tags.
- Swap the OG image (`src/app/opengraph-image.tsx`) for a designed one — it's currently a functional placeholder (brand mark + wordmark on off-white), explicitly left as a stand-in.

### 2. OTP & WhatsApp auth (currently mocked)
- Flip `FEATURE_MOCK_OTP` to `false` in production. It defaults to `true` (anything other than the literal string `"false"` counts as mock) — an explicit env var is required, not just omission.
- Flip `FEATURE_WHATSAPP_OTP` to `true` so OTPs actually send instead of logging to console.
- Replace the Twilio sandbox credentials with real production ones (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`) — sandbox numbers require each user to text a join keyword once, which doesn't scale past internal testing.
- Submit WhatsApp message templates to Meta for approval (required before sending outside the 24-hour session window) and upgrade from the Twilio sandbox to a registered WhatsApp Business number — both called out as prerequisites in `src/lib/whatsapp.ts`'s own production checklist comment.
- Point that WhatsApp number's "when a message comes in" webhook at `https://<domain>/api/whatsapp/webhook` — this is what makes the `CONFIRM <code>` reply-to-confirm flow work. Twilio can't reach `localhost`, so this literally cannot be tested until there's a public URL.
- Flip `FEATURE_WHATSAPP_NOTIFICATIONS` to `true` so interest/confirmation/reminder messages actually send (they currently only write to the in-app `notifications` table).

### 3. Supabase / database
- Confirm `schema.sql` is fully applied against the production Supabase project — it's a hand-run, append-only document, not a migration tool, so it's easy for the live DB to drift behind what's in the file. Read it top-to-bottom against the Supabase SQL editor's history rather than assuming it's in sync.
- Enable the `pg_cron` and `pg_net` extensions (Database → Extensions in Supabase) and run the two commented-out `cron.schedule(...)` blocks in `schema.sql` (~line 225 and ~line 340), substituting the real deployed URL — these can't be scheduled until there's a public URL to hit.
- Generate a real, random `CRON_SECRET` for production and use the exact same value in both the Vercel env var and the `Authorization: Bearer <CRON_SECRET>` header inside those `cron.schedule` calls.
- Double-check `SUPABASE_SERVICE_ROLE_KEY` only ever appears in server-side code (`src/lib/supabase.ts` and API routes) — it bypasses RLS entirely, so it must never reach a client bundle or a `NEXT_PUBLIC_*` var.

### 4. Product decisions that shouldn't happen by default
- **Registration is currently open and nationwide with no admin gate** (see the divergence note near the top of this file). Decide deliberately whether that's the actual intended public-launch shape, or whether the admin-approval gate + firm-level filtering need to be built first. Don't let "it already works this way" substitute for a decision.
- **`PLATFORM_FEE_RM` is `0`.** Confirm that's intentional for launch, not an oversight — raising it is a real monetisation decision, not a config tweak.
- **`PLATFORM_BANK_DETAILS` in `src/lib/billing.ts`** (Maybank, "Law Kaki Sdn Bhd", account `5123 4567 8901`) reads like placeholder data. Replace with the firm's real settlement account before any real poster is told to wire a fee there.

### 5. Cleanup before it's reachable by strangers
- Remove or auth-gate `/dev-preview` (`src/app/dev-preview/`) — it's `noindex` but still publicly loadable and shows fabricated job/picker data that would confuse a real visitor who lands on it directly.
- Confirm `/admin` access is provisioned deliberately — admin accounts are granted by flipping `users.is_admin` directly in the DB; there's no self-serve admin signup, so this is a manual step per admin, not a one-time setup task.

### 6. Legal & compliance
Not code changes, but blocking for a genuinely public (not just internal-pilot) opening — see **High-Priority Open Points** above: PDPA-compliant privacy policy, T&Cs covering picker-error liability, and the Bar Council fee-splitting question if commission ever becomes real.

---

## Working Principles for Claude

When building or designing for this project:

1. **Default to simple.** Lawyers are busy. Every screen should require minimal thinking. If a step can be removed, remove it.
2. **Mobile is the primary surface.** Lawyers will mostly use this between appointments. Design mobile-first.
3. **WhatsApp is the entry point.** Most users will arrive via a tapped link, not a typed URL. Pre-authenticated sessions matter.
4. **Don't over-design.** The brand is restraint. If there's more than one accent colour on a screen, something is wrong.
5. **Phase 1 only, going forward.** Don't add *new* Phase 2 features (Bar Council verification, real commission payments, escrow). Note: multi-firm access and platform-fee infrastructure have already shipped ahead of the original plan (see the divergence note at the top) — that's existing reality to work with, not licence to add more. If something is interesting but out of scope, note it and move on.
6. **Local context matters.** Addresses use Malaysian conventions. Commission is in RM. Time zones are MYT. Traffic patterns are KL-specific.
7. **Voice over volume.** Short copy beats long copy. *"30 mins to go"* beats *"This is a reminder that your appointment will commence in approximately 30 minutes from now."*
8. **Never hand-roll a dropdown/menu panel.** Any floating panel triggered from a button — dropdown, menu, notification list — must use the shared `Popover` primitive (`src/components/Popover.tsx`), not a bespoke `position: absolute` + click-away overlay. It positions from the trigger's `getBoundingClientRect()` and clamps to the viewport, so it can't get clipped off-screen at any width — the failure mode that motivated it (the notification bell's dropdown was cut off on mobile because it was anchored `right: 0` off a button that wasn't flush with the screen edge). See it in use in `Dashboard.tsx` (`NotificationBell`, `align="end"`), `Settings.tsx` and `LoginFlow.tsx` (firm picker, `align="stretch"`).

---

## What Law Kaki Is Not

- Not a legal document platform
- Not a client-facing tool
- Not trying to disrupt the legal profession — it works *within* how lawyers already operate
- Not a generic SaaS product with global aspirations
- Not colourful — colour is a signal, not a style choice

---

## The Bar

A lawyer finishes using Law Kaki and thinks: *"That was easy. Glad that's sorted."*

Not impressed by the technology. Not overwhelmed by features. Just — sorted.

---

*Law Kaki  |  CLAUDE.md  |  Version 1.1 — annotated against the codebase as of 2026-08-01; see `docs/PRD.md` for the full build-state audit*
