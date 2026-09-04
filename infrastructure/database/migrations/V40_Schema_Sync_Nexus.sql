-- ==============================================================================
-- BODY HARMONY -- V40 SCHEMA SYNC NEXUS (2026-02-19)
-- STATUS: CRITICAL HOTFIX
-- OBJECTIVE: Restore missing columns dropped during V38 rebuild to fix 500 API errors
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- ------------------------------------------------------------------------------
-- 1. Restore `username` to `students` table
-- ------------------------------------------------------------------------------
SET @dbname = DATABASE();
SET @tablename = "students";
SET @columnname = "username";
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE table_name = @tablename
                        AND table_schema = @dbname
                        AND column_name = @columnname
                ) > 0,
                "SELECT 1",
                "ALTER TABLE students ADD COLUMN username VARCHAR(50) DEFAULT NULL AFTER email, ADD UNIQUE KEY `username` (`username`);"
            )
    );
PREPARE stmt
FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- ------------------------------------------------------------------------------
-- 2. Restore `case_title` and `case_description` to `ai_clinical_cases`
-- ------------------------------------------------------------------------------
SET @tablename = "ai_clinical_cases";
SET @columnname = "case_title";
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE table_name = @tablename
                        AND table_schema = @dbname
                        AND column_name = @columnname
                ) > 0,
                "SELECT 1",
                "ALTER TABLE ai_clinical_cases ADD COLUMN case_title VARCHAR(255) DEFAULT 'Caso Clínico' AFTER student_id;"
            )
    );
PREPARE stmt
FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @columnname = "case_description";
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE table_name = @tablename
                        AND table_schema = @dbname
                        AND column_name = @columnname
                ) > 0,
                "SELECT 1",
                "ALTER TABLE ai_clinical_cases ADD COLUMN case_description TEXT DEFAULT NULL AFTER case_title;"
            )
    );
PREPARE stmt
FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- ------------------------------------------------------------------------------
-- 3. Audit
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_SYNC_V40',
        'CRITICAL',
        'system',
        'Restored missing columns (username, case_description)'
    );