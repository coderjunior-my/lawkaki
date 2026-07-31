# Law Kaki — Product Requirements Document

*Version 1.0 · 26 July 2026 · Status: Living document, reflects the codebase as built*

> This PRD is grounded in the actual shipped code, not just the product vision in `CLAUDE.md`. Where the two disagree, that's called out explicitly — a PRD that only restates aspirations isn't useful for planning what's left to build.

---

## 1. Overview

**Law Kaki** is a job-dispatch web application for Malaysian conveyancing lawyers. A lawyer who has a signing appointment they can't attend posts it; another lawyer nearby picks it up for an indicative fee. The platform handles discovery, confirmation, reminders, and post-job ratings.

**Tagline:** *Your best legal kaki on the ground.*

**Entry point:** WhatsApp. Users authenticate via WhatsApp OTP, not a traditional signup form, and receive job/notification alerts on WhatsApp as well as in-app.

---

## 2. Problem Statement

Conveyancing lawyers must be physically present for document signings (SPAs, loan documentation, MOTs, discharges, stamping). These appointments happen at the client's location and time — not the lawyer's — so a lawyer's afternoon can be consumed entirely by travel between two or three brief appointments across a wide area. Delegation to a nearby colleague already happens informally, over ad-hoc WhatsApp messages and favours. Law Kaki structures that existing behaviour into a searchable, trackable, rated marketplace.

---

## 3. Goals & Success Metrics

| Goal | How it's measured today |
|---|---|
| Validate that lawyers will actually delegate and pick up jobs through the app instead of ad-hoc WhatsApp | Jobs posted / jobs picked / time-to-confirmation (no analytics dashboard built yet — would need to be added) |
| Keep the loop fast enough that it beats "just texting someone" | Time from job post → confirmed picker; currently no SLA instrumentation |
| Build enough trust to sustain repeat use | Rating completion rate, cold-start-cleared picker count |

No analytics/reporting layer exists yet (see §9, Known Gaps). Success today can only be assessed by querying the database directly.

---

## 4. Users & Roles

| Role | Description | Enforcement today |
|---|---|---|
| **Poster** | Posts a job they can't attend | `users.role IN ('poster','both')` — UI-level only; the API doesn't reject a `picker`-only account from posting |
| **Picker** | Picks up nearby jobs for a fee | Same as above |
| **Admin** | *Intended* to control who's on the platform | **Not implemented.** See §9 — registration is fully self-serve and auto-approved. |

Most lawyers are both Poster and Picker at different times — `role` supports `"both"`.

---

## 5. Current Scope — What's Actually Live

Registration is **open and cross-firm nationwide**, not scoped to a single pilot firm:

- The firm picker at signup (`src/lib/lawFirms.ts`) lists **119 firms across all 13 states + 3 federal territories** — not just Kuala Lumpur/Selangor.
- `GET /api/jobs` has **no firm filter**. Any registered user, at any firm, sees and can pick up any open job, anywhere in the dataset. There is no per-firm data isolation.

This is a material departure from `CLAUDE.md`'s "Phase 1 — single firm, KL/Selangor only" framing, and is treated here as the current source of truth per product decision: **the documents describe the product as it actually behaves.** If firm-exclusivity is a requirement for a specific pilot partner, that's a scoping decision to make deliberately (see §10), not an assumption to bake into documentation.

---

## 6. Functional Requirements / What's Built

### 6.1 Landing & Authentication
- **Pre-login landing page** (`Landing.tsx`): brand hero illustration, audience-split benefit cards ("For Law Firms" / "For Lawyers"), a nationwide coverage map (real Malaysia geometry, CC BY 3.0 sourced, recoloured), a "How it works" 4-step explainer, single CTA.
- **WhatsApp OTP login** (`LoginFlow.tsx`): phone entry (Malaysian numbers, `+60` enforced) → 6-digit OTP (auto-verifies on last digit, resend after 30s) → for new numbers, profile setup (name, firm search, email with regex validation, role) → success screen → dashboard.
- OTP delivery is feature-flagged (`FEATURE_WHATSAPP_OTP`); falls back to `console.log` in dev, and a mock code (`123456`) is accepted when `FEATURE_MOCK_OTP` is on (default).
- Sessions: 30-day token in `sessions` table, bearer-token auth on every API route via `getUserIdFromToken`.

### 6.2 Job Lifecycle
State machine: `open → urgent → taken → completed`, or `→ cancelled` / `→ expired`.

| Action | Route | Notes |
|---|---|---|
| Post a job | `POST /api/jobs` | Also triggers a nationwide broadcast (§6.3) to every active poss­ible picker |
| Browse jobs | `GET /api/jobs` | Map + list view, filters: date, doc type, min fee |
| Express interest | `POST /api/jobs/interest` | Generates a 4-digit confirm code; poster is notified |
| Confirm a picker | `POST /api/jobs/confirm` (web) or WhatsApp reply `CONFIRM <code>` | Other pending interests on the job are auto-declined |
| Cancel | `POST /api/jobs/cancel` | Poster only, only from `open`/`urgent` |
| Mark complete | `POST /api/jobs/complete` | Poster only, only from `taken` |
| Job progress (signing done → docs collected → poster confirmed) | UI stepper in `Settings.tsx` `UpcomingTab` | **Mock data only — see §9** |

Interest lifecycle sweep (`/api/cron/sweep`, hourly): day-3 and day-7 reminder nudges to the poster, day-9 auto-expiry of the interest, 30-day idle-job auto-expiry.

### 6.3 Notifications
Two channels, one source of truth: every notification-worthy event writes a row to the `notifications` table **regardless of whether the WhatsApp send succeeds or `FEATURE_WHATSAPP_NOTIFICATIONS` is even on.** This is the deliberate fallback for WhatsApp being a single point of failure.

| Event | WhatsApp | In-app row | Role tag |
|---|---|---|---|
| OTP | ✅ | — (not applicable, pre-account) | — |
| New job broadcast | ✅ | ✅ | `picker` |
| Interest expressed | ✅ | — *(not yet written to `notifications`)* | — |
| Interest reminder (3d/7d) | ✅ | — *(not yet written to `notifications`)* | — |
| Picker confirmed | ✅ (both parties) | — *(not yet written to `notifications`)* | — |
| Appointment reminder (2h/30m) | ✅ | ✅ | `picker` + `poster` |
| Job cancelled | ❌ | ❌ | — |
| Job completed | ❌ | ❌ | — |
| Review submitted | ❌ | ❌ | — |
| Interest/job auto-expired | ❌ | ❌ | — |

The **bell icon** (`Dashboard.tsx` → `NotificationBell`) is fully wired: dropdown, unread-only amber dot, role-split tabs ("As picker" / "As poster" — shown only when the account role is `both`), mark-one-as-read (tap) and mark-all-as-read (scoped to the active tab).

### 6.4 Ratings
Three dimensions — punctuality, professionalism, completeness — 1–5 stars each, bidirectional (poster rates picker *and* picker rates poster, via `ratings.rater_role`). Comment field capped at 1,000 words with a live counter.

- **Cold-start rule is enforced server-side**: `picker_ratings` / `poster_ratings` views are only surfaced once `total_jobs >= 3` (`jobFormatters.ts`); otherwise the UI shows "Fewer than 3 completed jobs."
- **Milestone badges** (1/5/10 jobs) described in `CLAUDE.md` are **not implemented** anywhere in the codebase.
- Live, backend-wired review flow: `TaskTracker.tsx` → `PendingReviewCard` → `POST /api/reviews`.
- A second, **disconnected** review UI exists in `Settings.tsx` → `ReviewsTab` — see §9.

### 6.5 Settings
`Settings.tsx` is a fully designed four-tab panel (Profile, History, Upcoming, Reviews). **None of it is wired to the backend** — see §9 for the full breakdown.

---

## 7. Non-Functional Requirements

- **Mobile-first.** Lawyers use this between appointments; every screen assumes a phone.
- **WhatsApp as primary entry point.** Deep-link-friendly, pre-authenticated sessions matter more than a memorable URL.
- **Brand discipline.** Strict black (`#0F1F33`) / off-white (`#FAF7F2`) / warm-grey system with amber (`#E89020`) as the *only* accent — never more than one amber element on screen at a time as a UI-action signal (map/data-density visualisations like the coverage map or job pins are the documented exception, since multiple simultaneous "open" markers is real state, not decoration).
- **Malaysian locale.** RM currency, MYT timezone (`Asia/Kuala_Lumpur` hardcoded in date formatting), Malaysian phone number validation (`+601\d{7,9}`).
- **No payments in this phase.** All commission is indicative; settlement happens outside the platform.
- **Voice.** Short, grounded copy; light Malay in conversational touchpoints only (e.g. "Terima kasih, kaki."); UI chrome stays English.

---

## 8. System Architecture & Data Model

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), React, inline-styled components (no CSS framework beyond Tailwind base + hand-rolled design tokens in `globals.css`) |
| Backend | Next.js API routes |
| Database | PostgreSQL via Supabase (service-role key, RLS bypassed server-side) |
| WhatsApp | Twilio WhatsApp API, with a `console.log` dev fallback |
| Auth | WhatsApp OTP → bearer session token (not JWT — a random UUID stored server-side) |
| Cron | Supabase `pg_cron` + `pg_net` calling two authenticated routes: `/api/cron/sweep` (hourly) and `/api/cron/reminders` (every 5 min) |

**Core tables:** `users`, `otp_tokens`, `pending_sessions`, `sessions`, `jobs`, `job_interests`, `ratings`, `notifications`.
**Views:** `picker_ratings`, `poster_ratings` (cold-start-aware aggregates).

Full schema lives in `schema.sql`, which is written as an append-only, dated migration log — read it top-to-bottom for the actual current shape of any table.

---

## 9. Known Gaps & Risks

Ranked by how much they'd surprise someone who only read `CLAUDE.md` or the UI:

1. **No admin approval gate.** `CLAUDE.md` describes "admin-controlled onboarding." The actual code (`/api/auth/register`) auto-approves every registration — `status: "active"`, `verified: true` — with a comment reading *"Phase 1: all registrations auto-approved. Phase 2: check admin_approvals table."* Anyone with a Malaysian WhatsApp number can register as any listed firm today. The `AdminApproval` type exists in `types.ts` but is unused.
2. **`Settings.tsx` is a disconnected prototype.** Profile edits, job history, the "Upcoming" job-progress stepper, and one of the two review UIs all run on hardcoded `INIT_*` mock arrays — there is **zero `fetch()` call in the entire file**. Editing your name/email/firm in Settings does not persist anywhere. The live, backend-wired equivalents are `Dashboard.tsx`, `MyJobs.tsx`, `MyPickedJobs.tsx`, and `TaskTracker.tsx`.
3. **Availability & coverage-area preferences aren't persisted server-side.** The toggles exist in Settings' mock UI, and there's no `users` column for them — so "new job broadcast" (§6.3) can't actually target by area/availability yet; it notifies every active picker.
4. **No firm-level data isolation** (§5) — a deliberate documentation choice this round, but worth re-confirming before any firm-specific pilot commitment.
5. **Several notification types don't write to the `notifications` table yet**: interest-expressed, interest-reminder, confirmation, job-cancelled, job-completed, review-submitted. WhatsApp-only for now, meaning a lawyer with WhatsApp trouble misses these silently.
6. **No document handoff mechanism.** How the physical/scanned SPA gets from Poster to Picker is unsolved, same as `CLAUDE.md` flags.
7. **No quality floor for pickers.** No suspension threshold or appeals workflow; a poorly-rated picker stays fully active.
8. **No analytics/reporting.** Nothing in-app answers "how many jobs got posted this week" beyond a raw DB query.

---

## 10. Roadmap

### Immediate (close the PRD/code gap before any real pilot)
- Decide firm-scoping deliberately: ship as-is (open marketplace) or add a `firm_id` filter to `GET /api/jobs` + interest/confirm flows.
- Either wire `Settings.tsx` to real data or clearly mark it "Coming soon" in the UI so lawyers don't lose edits they think saved.
- Decide whether an admin-approval gate is needed before onboarding a real firm, or whether self-serve is the intended design going forward.

### Phase 2 — Open Marketplace (per `CLAUDE.md`, not yet started)
Bar Council roll-number verification + practising certificate upload, real commission via escrow (Billplz/Curlec), fee-splitting legal review.

### Phase 3 — Platform Maturity
Traffic-aware routing, analytics, case-management integrations, subscription tier.

---

## 11. Appendix — Feature Status at a Glance

| Feature | Status |
|---|---|
| WhatsApp OTP login | ✅ Live |
| Landing page | ✅ Live |
| Post / browse / filter jobs | ✅ Live |
| Express interest / confirm / cancel / complete | ✅ Live |
| New-job WhatsApp broadcast | ✅ Live |
| Appointment reminders (2h/30m) | ✅ Live |
| In-app notification inbox | ✅ Live (partial event coverage, §9.5) |
| 3-dimension bidirectional ratings | ✅ Live |
| Cold-start rating threshold | ✅ Live |
| Milestone badges | ❌ Not built |
| Settings — profile edit | ❌ UI only, no persistence |
| Settings — job history | ❌ Mock data |
| Settings — upcoming job stepper | ❌ Mock data |
| Settings — reviews (given/received) | ❌ Mock data, duplicate of live TaskTracker flow |
| Admin approval / onboarding control | ❌ Not built |
| Firm-scoped visibility | ❌ Not built (open by default) |
| Payments | ❌ Out of scope (Phase 2) |
| Bar Council verification | ❌ Out of scope (Phase 2) |
| Document handoff | ❌ Unsolved |
| Analytics/reporting | ❌ Not built |
