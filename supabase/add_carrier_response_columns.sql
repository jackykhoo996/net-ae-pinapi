-- Add carrier API response columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS carrier_request_raw  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS carrier_verify_raw   TEXT;
