CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_text TEXT NOT NULL,
    author VARCHAR(255),
    category VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    target_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Columns here mirror the INSERT in src/workers/analytics.worker.js, which is the
-- only writer. browser/os/device_type come from ua-parser-js and fall back to
-- 'Unknown' rather than being guaranteed, so they stay nullable.
CREATE TABLE IF NOT EXISTS scan_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    isp VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    user_agent TEXT,
    referer TEXT,
    request_method VARCHAR(16) NOT NULL,
    request_path VARCHAR(255) NOT NULL,
    response_status SMALLINT,
    response_time_ms INTEGER,
    quote_served TEXT,
    geo_status VARCHAR(32) NOT NULL DEFAULT 'not_requested',
    campaign_id BIGINT REFERENCES campaigns(id),
    browser VARCHAR(50),
    os VARCHAR(50),
    device_type VARCHAR(50),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Existing installs: the CREATE statements above are IF NOT EXISTS and will not
-- alter a table that already exists. Run these once to migrate an older scan_logs.
-- The DROPs discard data, so review them before running.
--
--   ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;
--   ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS campaign_id BIGINT REFERENCES campaigns(id);
--   ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS browser VARCHAR(50);
--   ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS os VARCHAR(50);
--   ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS device_type VARCHAR(50);
--   ALTER TABLE scan_logs DROP COLUMN IF EXISTS region;
--   ALTER TABLE scan_logs DROP COLUMN IF EXISTS processing_duration_ms;
--   ALTER TABLE scan_logs DROP COLUMN IF EXISTS quote_id;
--   ALTER TABLE scan_logs DROP COLUMN IF EXISTS enrichment_ms;
