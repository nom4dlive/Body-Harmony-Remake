-- ==============================================================================
-- BODY HARMONY -- V47 NEXUS WATCHTOWER INTELLIGENCE (2026-02-22)
-- STATUS: PLANNING -> EXECUTION
-- OBJECTIVE: Enhanced behavioral tracking and risk scoring
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. ENRICH licenciada_devices (ID & Location Tracking)
ALTER TABLE licenciada_devices
ADD COLUMN is_trusted TINYINT(1) DEFAULT 0
AFTER is_active,
    ADD COLUMN city VARCHAR(100) DEFAULT NULL
AFTER is_trusted,
    ADD COLUMN region VARCHAR(100) DEFAULT NULL
AFTER city,
    ADD COLUMN isp VARCHAR(150) DEFAULT NULL
AFTER region,
    ADD COLUMN fingerprint_hash VARCHAR(64) DEFAULT NULL
AFTER isp;
-- 2. ENRICH auth_logs (Behavioral Scoring)
ALTER TABLE auth_logs
ADD COLUMN risk_score INT DEFAULT 0
AFTER status,
    ADD COLUMN risk_details JSON DEFAULT NULL
AFTER risk_score;
-- 3. AUDIT ENTRY
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_SYNC_V47',
        'INFO',
        'system',
        'Implemented Watchtower 2.0 Behavioral Intelligence columns (score, location, fingerprint).'
    );