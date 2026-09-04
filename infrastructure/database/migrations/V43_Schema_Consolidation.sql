-- ==============================================================================
-- BODY HARMONY -- V43 SCHEMA CONSOLIDATION (2026-02-20)
-- STATUS: PRODUCTION SYNC
-- OBJECTIVE: Sync auth_logs and ai_clinical_cases with Nexus V3.1 Controllers
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. FIX AUTH_LOGS: Migrate 'success' to 'status' ENUM
-- We check if 'status' exists first.
SET @dbname = DATABASE();
SET @tablename = 'auth_logs';
SET @columnname = 'status';
SET @exists = (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @dbname
            AND table_name = @tablename
            AND column_name = @columnname
    );
-- If status doesn't exist, we add it. 
-- We'll use a safer approach: Add status, copy success data, then drop success.
ALTER TABLE auth_logs
ADD COLUMN IF NOT EXISTS status ENUM(
        'success',
        'failure_credentials',
        'failure_suspended',
        'failure_system'
    ) DEFAULT 'failure_credentials'
AFTER user_agent;
-- Update status based on success column (1 = success, 0 = failure_credentials)
UPDATE auth_logs
SET status = 'success'
WHERE success = 1
    AND (
        status IS NULL
        OR status = 'failure_credentials'
    );
UPDATE auth_logs
SET status = 'failure_credentials'
WHERE success = 0
    AND (
        status IS NULL
        OR status = 'success'
    );
-- Now drop success if it exists
SET @success_exists = (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @dbname
            AND table_name = @tablename
            AND column_name = 'success'
    );
-- Note: MySQL doesn't support IF EXISTS in ALTER TABLE DROP COLUMN directly in all versions, 
-- but we can do it via a procedure or just try it. Since this is a one-off migration script:
ALTER TABLE auth_logs DROP COLUMN IF EXISTS success;
-- 2. FIX AI_CLINICAL_CASES: Add missing Neural Oversight columns
ALTER TABLE ai_clinical_cases
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5, 2) DEFAULT 0.00
AFTER photo_path;
ALTER TABLE ai_clinical_cases
ADD COLUMN IF NOT EXISTS is_admin_test TINYINT(1) DEFAULT 0
AFTER needs_review;
-- 3. AUDIT ENTRY
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_SYNC_V43',
        'INFO',
        'system',
        'Consolidated auth_logs and clinical_cases schema for Nexus V3.1 compatibility.'
    );