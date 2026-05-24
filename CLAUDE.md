# CLAUDE.md — Law Kaki

> Context file for Claude when working on the Law Kaki project. Read this first before any design, code, or product task.

---

## What This Project Is

**Law Kaki** is an internal job dispatch web application for conveyancing lawyers within a single Malaysian law firm. Lawyers post signing appointments they can't attend. Colleagues pick them up. The platform handles routing, conflict detection, reminders, and ratings.

**Tagline:** *Your best legal kaki on the ground.*

**Pilot scope:** One law firm. Kuala Lumpur and Selangor only. No other Malaysian states.

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
| **Admin** | The managing partner or ops manager. Controls who is on the platform. |

One lawyer is usually both Poster and Picker at different times.

---

## Core Product Loop

1. Poster opens WhatsApp link → posts a job (address, time, doc type, indicative commission, notes)
2. All eligible Pickers get a WhatsApp notification
3. Picker opens the map dashboard → sees pins → selects one or more jobs
4. System checks route feasibility → flags time conflicts
5. Picker confirms → Poster is notified, both see each other's contact
6. WhatsApp reminders fire 2hrs and 30mins before each appointment
7. After the appointment, Poster marks the job Complete and rates the Picker

---

## Phases (Important — Don't Conflate Them)

### Phase 1 — Internal Firm Pilot (current build)
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

### Spacing
Generous whitespace. The monochrome palette means breathing room separates sections — not colour blocks.

---

## Rating System

Three dimensions, 1–5 stars each, all rated by the Poster after job completion:

| Dimension | Question |
|---|---|
| Punctuality | Did they arrive on time? |
| Professionalism | Did they represent the firm well? |
| Completeness | Were all documents handled correctly? |

**Rules:**
- Unlocked only after job marked Complete
- Public to all firm members
- Minimum 3 completed jobs before score is displayed (cold start protection)
- Milestone badges at 1, 5, and 10 jobs

---

## Monetisation (Phase 2+, Not Pilot)

- **Recommended:** Hybrid — small listing fee from Poster (RM3–5) + success fee from Picker (8–10% of commission)
- **Launch strategy:** Waive all fees for the first 6 months of public launch
- **Phase 1 pilot:** No fees at all. No money flow through platform.

---

## Payment Handling

- **Phase 1:** No platform-mediated payments. Direct transfer between lawyers, settled internally by the firm.
- **Phase 2:** Escrow via Billplz or Curlec (FPX-enabled). May require money services licence at volume — consult fintech lawyer before launch.
- **Not using:** Stripe Connect (limited Malaysia payout support).

---

## Tech Stack

| Layer | Tool |
|---|---|
| WhatsApp Interface | Twilio WhatsApp API or 360dialog |
| Frontend | React or Next.js |
| Backend | Node.js or Python (FastAPI) |
| Database | PostgreSQL |
| Maps | Google Maps Platform — Places, Routes, Directions APIs |
| Map Style | Custom greyscale style (mandatory per brand) |
| Auth | WhatsApp OTP → JWT session |
| Payments (Phase 1) | None |
| Payments (Phase 2) | Billplz or Curlec |
| Hosting | AWS or Railway.app |

---

## Known Weak Spots (Don't Forget These)

These are the gaps we've already identified. If a design or code decision touches one of these, flag it.

1. **Document handoff is unsolved.** How does the original SPA get from Poster to Picker physically? Not yet designed.
2. **Client experience is an afterthought.** The client meets a different lawyer than they retained. No feature addresses their communication or comfort.
3. **Rating cold start.** New lawyers have no rating, get fewer jobs, can't build a rating. Loop not yet broken.
4. **WhatsApp single point of failure.** No email or in-app fallback if Meta changes API pricing or a lawyer's WhatsApp breaks.
5. **Conflict alerts are reactive.** They fire after the Picker selects conflicting jobs. Should proactively suggest compatible bundles.
6. **No quality floor for Pickers.** A 2-star Picker is still on the platform. No suspension threshold, no appeals workflow.

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

## Working Principles for Claude

When building or designing for this project:

1. **Default to simple.** Lawyers are busy. Every screen should require minimal thinking. If a step can be removed, remove it.
2. **Mobile is the primary surface.** Lawyers will mostly use this between appointments. Design mobile-first.
3. **WhatsApp is the entry point.** Most users will arrive via a tapped link, not a typed URL. Pre-authenticated sessions matter.
4. **Don't over-design.** The brand is restraint. If there's more than one accent colour on a screen, something is wrong.
5. **Phase 1 only.** Don't add features that belong to Phase 2 (verification flows, payments, multi-firm logic). If something is interesting but out of scope, note it and move on.
6. **Local context matters.** Addresses use Malaysian conventions. Commission is in RM. Time zones are MYT. Traffic patterns are KL-specific.
7. **Voice over volume.** Short copy beats long copy. *"30 mins to go"* beats *"This is a reminder that your appointment will commence in approximately 30 minutes from now."*

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

*Law Kaki  |  CLAUDE.md  |  Version 1.0*
