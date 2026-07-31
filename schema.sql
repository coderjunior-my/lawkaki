-- =============================================================================
-- Law Kaki — PostgreSQL Schema (Phase 1 Pilot)
-- Run in Supabase SQL editor (Project → SQL Editor → New query).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- users
-- One record per lawyer. Phone is canonical identity.
-- Phase 1: firm stored as name/state text; no FK to law_firms table.
-- Phase 2: add FK once law_firms is seeded and verified via Bar Council.
-- =============================================================================
CREATE TABLE users (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        VARCHAR(20)  NOT NULL UNIQUE,
  name         VARCHAR(200),
  email        VARCHAR(200),
  role         VARCHAR(10)  NOT NULL DEFAULT 'both'
                 CHECK (role IN ('poster', 'picker', 'both')),
  firm_name    VARCHAR(300),
  firm_state   VARCHAR(50)
                 CHECK (firm_state IN ('Kuala Lumpur', 'Selangor')),
  verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  verified_at  TIMESTAMPTZ,
  onboarded    BOOLEAN      NOT NULL DEFAULT FALSE,
  onboarded_at TIMESTAMPTZ,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'active', 'suspended')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX users_phone_idx   ON users (phone);
CREATE INDEX users_status_idx  ON users (status);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- =============================================================================
-- otp_tokens
-- Short-lived 6-digit codes sent via WhatsApp.
-- =============================================================================
CREATE TABLE otp_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      VARCHAR(20) NOT NULL,
  code       VARCHAR(6)  NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  attempts   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX otp_tokens_phone_idx      ON otp_tokens (phone);
CREATE INDEX otp_tokens_expires_at_idx ON otp_tokens (expires_at);

-- =============================================================================
-- pending_sessions
-- Short-lived token bridging OTP verification and registration (10 min).
-- =============================================================================
CREATE TABLE pending_sessions (
  token      VARCHAR(128) PRIMARY KEY,
  phone      VARCHAR(20)  NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX pending_sessions_expires_at_idx ON pending_sessions (expires_at);

-- =============================================================================
-- sessions
-- Persistent app sessions (30 days).
-- =============================================================================
CREATE TABLE sessions (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX sessions_token_idx   ON sessions (token);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- =============================================================================
-- jobs
-- A conveyancing appointment posted for delegation.
-- map_x / map_y: SVG coordinates for the Phase 1 mock map (replace with
-- lat/lng in Phase 2 when using real Google Maps).
-- =============================================================================
CREATE TYPE job_state AS ENUM ('open', 'urgent', 'taken', 'completed', 'cancelled');
CREATE TYPE doc_type  AS ENUM (
  'SPA signing',
  'Loan documentation',
  'Discharge of Charge',
  'Transfer at Land Office',
  'Stamping at LHDN',
  'Other'
);

CREATE TABLE jobs (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  state           job_state    NOT NULL DEFAULT 'open',
  doc_type        doc_type     NOT NULL,
  venue           VARCHAR(300) NOT NULL,
  address         VARCHAR(500) NOT NULL,
  area            VARCHAR(100),
  appointment_at  TIMESTAMPTZ  NOT NULL,
  fee_indicative  INT          NOT NULL CHECK (fee_indicative >= 0),
  notes           TEXT,
  poster_id       UUID         NOT NULL REFERENCES users (id),
  picker_id       UUID         REFERENCES users (id),
  picked_at       TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  payment_status  VARCHAR(10)  CHECK (payment_status IN ('paid', 'unpaid')),
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  map_x           SMALLINT,
  map_y           SMALLINT,
  distance_text   VARCHAR(30),
  duration_text   VARCHAR(30),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX jobs_state_idx          ON jobs (state);
CREATE INDEX jobs_poster_id_idx      ON jobs (poster_id);
CREATE INDEX jobs_picker_id_idx      ON jobs (picker_id);
CREATE INDEX jobs_appointment_at_idx ON jobs (appointment_at);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- =============================================================================
-- job_interests
-- Picker expresses interest in a job before the poster confirms them.
-- =============================================================================
CREATE TABLE job_interests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID        NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  picker_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expressed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, picker_id)
);

CREATE INDEX job_interests_job_id_idx    ON job_interests (job_id);
CREATE INDEX job_interests_picker_id_idx ON job_interests (picker_id);

-- =============================================================================
-- ratings
-- Poster rates Picker after job is marked Complete.
-- Cold-start: score shown only after 3+ completed jobs.
-- =============================================================================
CREATE TABLE ratings (
  id              UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID     NOT NULL UNIQUE REFERENCES jobs (id),
  poster_id       UUID     NOT NULL REFERENCES users (id),
  picker_id       UUID     NOT NULL REFERENCES users (id),
  punctuality     SMALLINT NOT NULL CHECK (punctuality     BETWEEN 1 AND 5),
  professionalism SMALLINT NOT NULL CHECK (professionalism BETWEEN 1 AND 5),
  completeness    SMALLINT NOT NULL CHECK (completeness    BETWEEN 1 AND 5),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ratings_picker_id_idx ON ratings (picker_id);
CREATE INDEX ratings_poster_id_idx ON ratings (poster_id);

-- Aggregate view — consumed by profile and interest list UIs.
-- Cold-start: only expose when total_jobs >= 3 (enforced in app layer).
CREATE VIEW picker_ratings AS
SELECT
  picker_id,
  COUNT(*)                                                                   AS total_jobs,
  ROUND(AVG((punctuality + professionalism + completeness)::numeric / 3), 2) AS avg_rating,
  ROUND(AVG(punctuality::numeric),     2)                                    AS avg_punctuality,
  ROUND(AVG(professionalism::numeric), 2)                                    AS avg_professionalism,
  ROUND(AVG(completeness::numeric),    2)                                    AS avg_completeness
FROM ratings
GROUP BY picker_id;

-- =============================================================================
-- Job lifecycle statuses — added 2026-07-20
-- Adds the 'expired' job state (30-day idle sweep) and per-interest tracking
-- for the 3-day / 7-day reminder → 9-day expiry schedule on unconfirmed
-- interest, plus a 'declined' interest status for pickers who weren't chosen
-- once the poster confirmed someone else. Run this section against an
-- existing database that only has the tables above.
-- =============================================================================

ALTER TYPE job_state ADD VALUE IF NOT EXISTS 'expired';

ALTER TABLE job_interests
  ADD COLUMN IF NOT EXISTS status               VARCHAR(10) NOT NULL DEFAULT 'pending'
                                                    CHECK (status IN ('pending', 'expired', 'declined')),
  ADD COLUMN IF NOT EXISTS confirm_code         VARCHAR(6),
  ADD COLUMN IF NOT EXISTS reminder_3d_sent_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_7d_sent_at  TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS job_interests_confirm_code_idx
  ON job_interests (confirm_code) WHERE confirm_code IS NOT NULL;

-- Safety net if you already ran the block above before 'declined' was added —
-- re-running this on a fresh setup is a harmless no-op.
ALTER TABLE job_interests DROP CONSTRAINT IF EXISTS job_interests_status_check;
ALTER TABLE job_interests ADD CONSTRAINT job_interests_status_check
  CHECK (status IN ('pending', 'expired', 'declined'));

-- ─── One-time setup — run after deploying, with your live app URL ───────────
-- Requires the pg_cron and pg_net extensions (enable under Database →
-- Extensions in the Supabase dashboard, or run the two CREATE EXTENSION
-- lines below if you have permission).
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- SELECT cron.schedule(
--   'lawkaki-job-sweep', '0 * * * *',  -- hourly
--   $$ SELECT net.http_post(
--        url     := 'https://<your-app-domain>/api/cron/sweep',
--        headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'),
--        body    := '{}'::jsonb
--      ) $$
-- );

-- =============================================================================
-- Bidirectional reviews — added 2026-07-20
-- ratings.job_id was UNIQUE (one rating per job, always poster-rates-picker).
-- Widened to one rating per (job, direction) so a picker can also rate the
-- poster on the same job. picker_ratings keeps its original meaning (only
-- poster-authored ratings); poster_ratings is the new symmetric view.
-- =============================================================================

DO $$
DECLARE cname text;
BEGIN
  SELECT tc.constraint_name INTO cname
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'ratings' AND tc.constraint_type = 'UNIQUE' AND kcu.column_name = 'job_id'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE ratings DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE ratings
  ADD COLUMN IF NOT EXISTS rater_role VARCHAR(10) NOT NULL DEFAULT 'poster'
    CHECK (rater_role IN ('poster', 'picker'));

ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_job_id_rater_role_key;
ALTER TABLE ratings ADD CONSTRAINT ratings_job_id_rater_role_key UNIQUE (job_id, rater_role);

CREATE OR REPLACE VIEW picker_ratings AS
SELECT
  picker_id,
  COUNT(*)                                                                   AS total_jobs,
  ROUND(AVG((punctuality + professionalism + completeness)::numeric / 3), 2) AS avg_rating,
  ROUND(AVG(punctuality::numeric),     2)                                    AS avg_punctuality,
  ROUND(AVG(professionalism::numeric), 2)                                    AS avg_professionalism,
  ROUND(AVG(completeness::numeric),    2)                                    AS avg_completeness
FROM ratings
WHERE rater_role = 'poster'
GROUP BY picker_id;

-- New — the poster's own score, built from picker-authored ratings.
CREATE OR REPLACE VIEW poster_ratings AS
SELECT
  poster_id,
  COUNT(*)                                                                   AS total_jobs,
  ROUND(AVG((punctuality + professionalism + completeness)::numeric / 3), 2) AS avg_rating,
  ROUND(AVG(punctuality::numeric),     2)                                    AS avg_punctuality,
  ROUND(AVG(professionalism::numeric), 2)                                    AS avg_professionalism,
  ROUND(AVG(completeness::numeric),    2)                                    AS avg_completeness
FROM ratings
WHERE rater_role = 'picker'
GROUP BY poster_id;

-- =============================================================================
-- notifications — added 2026-07-24
-- Every WhatsApp-worthy event writes a row here regardless of whether the
-- WhatsApp send actually succeeds (Twilio down, flag off, number invalid,
-- etc). This is the in-app fallback called out as a known weak spot in
-- CLAUDE.md — a lawyer with a broken WhatsApp still has a record in Law Kaki.
-- whatsapp_sent_at is set only when the WhatsApp leg was attempted AND
-- succeeded; NULL means the event only exists here.
--
-- type is intentionally a free VARCHAR, not an ENUM/CHECK — this list will
-- keep growing (job_cancelled, review_received, etc.) and each addition
-- shouldn't need a migration. Known values as of this migration:
--   'new_job_broadcast'        — new job posted, sent to eligible pickers
--   'interest_received'        — a picker expressed interest, sent to the poster
--   'interest_reminder'        — day-3 / day-7 nudge to confirm a pending interest
--   'job_confirmed'            — poster confirmed a picker, sent to both parties
--   'appointment_reminder_2h'  — 2 hours before a confirmed appointment
--   'appointment_reminder_30m' — 30 minutes before a confirmed appointment
--
-- role records which hat the recipient was wearing when this notification
-- was generated (e.g. the same appointment reminder writes one row with
-- role='picker' for the picker and one row with role='poster' for the
-- poster). The inbox UI uses this to split "As poster" / "As picker" tabs
-- without having to join back to jobs to work out which side the user was on.
-- =============================================================================
CREATE TABLE notifications (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  job_id           UUID         REFERENCES jobs (id) ON DELETE CASCADE,
  type             VARCHAR(40)  NOT NULL,
  role             VARCHAR(10)  NOT NULL CHECK (role IN ('poster', 'picker')),
  title            VARCHAR(200) NOT NULL,
  body             TEXT,
  whatsapp_sent_at TIMESTAMPTZ,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON notifications (user_id, created_at DESC);
CREATE INDEX notifications_unread_idx  ON notifications (user_id) WHERE read_at IS NULL;
CREATE INDEX notifications_job_id_idx  ON notifications (job_id);

-- Reminder de-duplication — one 2h and one 30m reminder per confirmed job,
-- regardless of how often the reminder cron polls.
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS reminder_2h_sent_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_30m_sent_at TIMESTAMPTZ;

-- ─── Second cron schedule — appointment reminders ───────────────────────────
-- The hourly sweep above is far too coarse for a 30-minute reminder window,
-- so this runs on its own, tighter schedule. Every 5 minutes comfortably
-- catches both the 2h and 30m windows without spamming.
--
-- SELECT cron.schedule(
--   'lawkaki-appointment-reminders', '*/5 * * * *',
--   $$ SELECT net.http_post(
--        url     := 'https://<your-app-domain>/api/cron/reminders',
--        headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'),
--        body    := '{}'::jsonb
--      ) $$
-- );

-- =============================================================================
-- Widen users.firm_state to all states — added 2026-07-26
-- firm_state was still constrained to the original KL/Selangor-only pilot
-- scope, but the firm directory (src/lib/lawFirms.ts) expanded to all 13
-- states + 3 federal territories a while back. Registration for any firm
-- outside KL/Selangor was silently failing this CHECK constraint — caught by
-- testing a live signup end-to-end during the first deployment. Widen it to
-- match MalaysianState in src/lib/types.ts.
-- =============================================================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_firm_state_check;
ALTER TABLE users ADD CONSTRAINT users_firm_state_check
  CHECK (firm_state IN (
    'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
    'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang',
    'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
  ));

-- =============================================================================
-- Bank details completion flag — added 2026-07-27
-- Phase 1 has no platform-mediated payments (settlement happens directly
-- between lawyers/firms), so we deliberately don't store real bank account
-- numbers here — that's PII with its own handling requirements and isn't
-- needed yet. This is just a completion flag driving the persistent
-- "add your bank details" critical notice until a picker has done it once
-- via their firm/bank's own channel.
-- =============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bank_details_added BOOLEAN NOT NULL DEFAULT FALSE;

-- =============================================================================
-- Platform billing (Poster → platform) — added 2026-07-28
-- Posters pay a platform fee to Law Kaki itself (separate from the
-- indicative commission they pay a picker directly). The fee is RM0.00
-- today — this is the infrastructure for turning it on later, per
-- CLAUDE.md's Phase 2 "small listing fee from Poster" monetisation note.
--
-- One fee_transactions row per COMPLETED job (success-fee model, not a
-- listing fee — nothing is owed for a job that's cancelled or never
-- picked up). due_at is set 7 days out at creation; separately, if a
-- poster's total unpaid balance exceeds the RM1,000 threshold, ALL of
-- their unpaid transactions become payable immediately regardless of
-- individual due dates — that's computed at query time (SUM unpaid),
-- not stored, so it always reflects the live balance.
--
-- No real payment gateway in Phase 1, so settlement is manual bank
-- transfer: a poster selects transactions, submits a platform_payments
-- row (status 'pending'), and an admin (users.is_admin) confirms or
-- rejects it against what actually landed in the account. Confirming
-- flips the covered transactions to 'paid'; rejecting clears
-- payment_id so the poster can resubmit.
-- =============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE platform_payments (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id      UUID         NOT NULL REFERENCES users (id),
  method         VARCHAR(20)  NOT NULL DEFAULT 'bank_transfer'
                   CHECK (method IN ('bank_transfer', 'payment_gateway')),
  total_amount   INT          NOT NULL CHECK (total_amount >= 0),
  reference      VARCHAR(200),
  status         VARCHAR(10)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'rejected')),
  submitted_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    UUID         REFERENCES users (id)
);

CREATE INDEX platform_payments_poster_id_idx ON platform_payments (poster_id);
CREATE INDEX platform_payments_status_idx    ON platform_payments (status);

CREATE TABLE fee_transactions (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID         NOT NULL UNIQUE REFERENCES jobs (id),
  poster_id    UUID         NOT NULL REFERENCES users (id),
  amount       INT          NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status       VARCHAR(10)  NOT NULL DEFAULT 'unpaid'
                 CHECK (status IN ('unpaid', 'paid')),
  due_at       TIMESTAMPTZ  NOT NULL,
  payment_id   UUID         REFERENCES platform_payments (id),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX fee_transactions_poster_id_idx  ON fee_transactions (poster_id);
CREATE INDEX fee_transactions_status_idx     ON fee_transactions (status);
CREATE INDEX fee_transactions_payment_id_idx ON fee_transactions (payment_id);

-- =============================================================================
-- Real bank details — added 2026-07-29
-- Replaces the earlier bank_details_added placeholder flag with the actual
-- data it was standing in for. bank_details_added is now derived
-- (bank_account_number IS NOT NULL), not stored, so it can't drift from
-- the real data.
-- =============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bank_name           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(30);

ALTER TABLE users DROP COLUMN IF EXISTS bank_details_added;

-- =============================================================================
-- Bank account holder name — added 2026-07-29
-- Originally this was locked to users.name (account must be the logged-in
-- user's own) — relaxed per product decision: any account holder name is
-- allowed (e.g. paying into a spouse's or firm's account), so it needs its
-- own column instead of being derived.
-- =============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bank_account_holder_name VARCHAR(200);

-- =============================================================================
-- Email uniqueness — added 2026-07-31
-- The registration form has always collected a law firm email, but it was
-- never persisted (app-layer bug) and had no uniqueness guard, so nothing
-- stopped a second account from registering with someone else's email or a
-- phone number that already had an account (the register upsert would
-- silently overwrite the existing row). The app layer now checks both
-- before insert; this index is the DB-level backstop. Case-insensitive
-- because firm emails are typically typed in mixed case. Existing rows are
-- all NULL (email was never written), which a unique index permits — NULLs
-- don't collide with each other in Postgres.
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (LOWER(email));
