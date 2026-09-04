-- ==============================================================================
-- BODY HARMONY -- V44 FORENSICS ENUM EXPANSION (2026-02-20)
-- STATUS: PRODUCTION SYNC
-- OBJECTIVE: Expand ai_mentorship_logs ENUM and fix data integrity
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. EXPAND interaction_type ENUM
ALTER TABLE ai_mentorship_logs
MODIFY COLUMN interaction_type ENUM(
        'TEXT',
        'VISION',
        'DOWNLOAD_RAW',
        'DOWNLOAD_PROTECTED',
        'WIDGET_EVENT',
        'GENERATION_MATRIX'
    ) NOT NULL DEFAULT 'TEXT';
-- 2. ENSURE action COLUMN IS VERSATILE
ALTER TABLE ai_mentorship_logs
MODIFY COLUMN action VARCHAR(100) DEFAULT NULL;
-- 3. AUDIT ENTRY
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_SYNC_V44',
        'INFO',
        'system',
        'Expanded forensics interaction types and action column.'
    );