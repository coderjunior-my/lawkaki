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
