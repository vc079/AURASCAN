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

CREATE TABLE IF NOT EXISTS scan_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    isp VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    user_agent TEXT,
    referer TEXT,
    request_method VARCHAR(16) NOT NULL,
    request_path VARCHAR(255) NOT NULL,
    response_status SMALLINT,
    processing_duration_ms INTEGER,
    quote_id BIGINT REFERENCES quotes(id),
    quote_served TEXT,
    geo_status VARCHAR(32) NOT NULL DEFAULT 'not_requested',
    enrichment_ms INTEGER,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);