-- f:\Body-Harmony-Remake\infrastructure\database\migrations\V51_Sync_Access_Logs.sql
-- Protocol V51.1: Final Access Log Sync (Idempotent)
-- 1. Ensure user_type ENUM includes 'licenciada'
-- We use MODIFY for safety
ALTER TABLE lms_access_logs
MODIFY COLUMN user_type ENUM('student', 'licenciada', 'admin', 'system') NOT NULL;
-- 2. Migrate existing 'student' strings to 'licenciada' for ENUM compliance
UPDATE lms_access_logs
SET user_type = 'licenciada'
WHERE user_type = 'student';
-- 3. Audit Log of completion
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'MIGRATION_V51_FINAL',
        'INFO',
        'system',
        'Protocol V51.1: ENUM user_type updated and data migrated to licenciada.'
    );