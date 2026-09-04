-- ==============================================================================
-- BODY HARMONY -- V42 RESTORE PROFILE PHOTO STUB (2026-02-20)
-- STATUS: PRODUCTION HOTFIX
-- OBJECTIVE: Add profile_photo as a nullable stub for legacy DB query support
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- Add profile_photo stub if it does not exist
ALTER TABLE students
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255) DEFAULT NULL COMMENT 'Legacy stub for backwards compatibility'
AFTER photo_url;
-- Audit entry
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_SYNC_V42',
        'INFO',
        'system',
        'Restored legacy profile_photo column as a stub in students table to prevent 500 errors in legacy scripts.'
    );