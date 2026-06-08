-- leads: one row per PIN request attempt (no UNIQUE on msisdn — allows retry after failed PIN)
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id        TEXT NOT NULL,
  msisdn          TEXT NOT NULL,
  request_id      TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  offer_id        TEXT NOT NULL DEFAULT '4910',
  aff_id          TEXT NOT NULL DEFAULT '598',
  carrier         TEXT NOT NULL DEFAULT 'Etisalat',
  country         TEXT NOT NULL DEFAULT 'UAE',
  lander          TEXT NOT NULL DEFAULT 'v1',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at    TIMESTAMPTZ
);

-- Migration: ALTER TABLE leads ADD COLUMN lander TEXT NOT NULL DEFAULT 'v1';

-- postback_logs: one row per postback fire attempt
CREATE TABLE postback_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID NOT NULL REFERENCES leads(id),
  postback_url    TEXT NOT NULL,
  http_status     INT,
  response_body   TEXT,
  fired_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success         BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE postback_logs ENABLE ROW LEVEL SECURITY;

-- anon key gets read-only SELECT (used by dashboard)
CREATE POLICY "anon read leads"
  ON leads FOR SELECT USING (true);

CREATE POLICY "anon read postback_logs"
  ON postback_logs FOR SELECT USING (true);

-- Performance indexes for dashboard queries
CREATE INDEX idx_leads_msisdn        ON leads (msisdn);
CREATE INDEX idx_leads_status        ON leads (status);
CREATE INDEX idx_leads_created_at    ON leads (created_at DESC);
CREATE INDEX idx_postback_logs_lead_id ON postback_logs (lead_id);
