-- =============================================================================
-- Law Kaki — PostgreSQL Schema (Phase 1 Pilot)
-- Run against PostgreSQL 14+ with the pgcrypto extension enabled.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- law_firms
-- Master list of approved law firms. Admin-managed for Phase 1.
-- =============================================================================
CREATE TABLE law_firms (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(300) NOT NULL,
  slug       VARCHAR(300) NOT NULL UNIQUE,          -- url-safe: "skrine", "zaid-ibrahim-co"
  state      VARCHAR(50)  NOT NULL
               CHECK (state IN ('Kuala Lumpur', 'Selangor')),
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX law_firms_name_idx  ON law_firms (name);
CREATE INDEX law_firms_state_idx ON law_firms (state);

-- =============================================================================
-- users
-- One record per lawyer on the platform.
-- Phone is the canonical identity; name/email filled in later.
-- =============================================================================
CREATE TABLE users (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        VARCHAR(20)  NOT NULL UNIQUE,      -- E.164: +601XXXXXXXXX
  name         VARCHAR(200),
  email        VARCHAR(200),
  role         VARCHAR(10)  NOT NULL DEFAULT 'both'
                 CHECK (role IN ('poster', 'picker', 'both')),
  firm_id      UUID         REFERENCES law_firms (id),
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
CREATE INDEX users_firm_id_idx ON users (firm_id);
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
-- Short-lived 6-digit codes sent via WhatsApp OTP.
-- Sweep expired rows periodically (cron or pg_cron).
-- =============================================================================
CREATE TABLE otp_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      VARCHAR(20) NOT NULL,
  code       VARCHAR(6)  NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,        -- 5 minutes from creation
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  attempts   INT         NOT NULL DEFAULT 0,    -- lock out after 3 failed attempts
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX otp_tokens_phone_idx      ON otp_tokens (phone);
CREATE INDEX otp_tokens_expires_at_idx ON otp_tokens (expires_at);

-- =============================================================================
-- sessions
-- Persistent app sessions after registration is complete.
-- =============================================================================
CREATE TABLE sessions (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,        -- 30 days
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX sessions_token_idx   ON sessions (token);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- =============================================================================
-- admin_approvals  (Phase 1)
-- Admin pre-approves phone numbers before they can self-register.
-- Phase 2: replace with Malaysian Bar Council roll number verification.
-- =============================================================================
CREATE TABLE admin_approvals (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(20) NOT NULL UNIQUE,
  firm_id       UUID        REFERENCES law_firms (id),
  approved_by   UUID        REFERENCES users (id),
  approved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes         TEXT
);

CREATE INDEX admin_approvals_phone_idx ON admin_approvals (phone);

-- =============================================================================
-- jobs
-- A conveyancing appointment posted by a Poster for delegation.
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
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  state           job_state   NOT NULL DEFAULT 'open',
  doc_type        doc_type    NOT NULL,
  venue           VARCHAR(300) NOT NULL,           -- e.g. "Public Bank · KLCC"
  address         VARCHAR(500) NOT NULL,           -- full Malaysian address
  area            VARCHAR(100),                    -- neighbourhood label: "Mont Kiara"
  appointment_at  TIMESTAMPTZ NOT NULL,
  fee_indicative  INT         NOT NULL CHECK (fee_indicative >= 0),  -- RM, whole number
  notes           TEXT,
  poster_id       UUID        NOT NULL REFERENCES users (id),
  picker_id       UUID        REFERENCES users (id),
  picked_at       TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX jobs_state_idx          ON jobs (state);
CREATE INDEX jobs_poster_id_idx      ON jobs (poster_id);
CREATE INDEX jobs_picker_id_idx      ON jobs (picker_id);
CREATE INDEX jobs_appointment_at_idx ON jobs (appointment_at);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- =============================================================================
-- ratings
-- Poster rates Picker after job is marked Complete.
-- Three dimensions: punctuality, professionalism, completeness.
-- Cold-start protection: score displayed only after 3+ completed jobs.
-- =============================================================================
CREATE TABLE ratings (
  id              UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID     NOT NULL UNIQUE REFERENCES jobs (id),  -- one rating per job
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

-- Aggregate view consumed by the profile and job-card UIs
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
