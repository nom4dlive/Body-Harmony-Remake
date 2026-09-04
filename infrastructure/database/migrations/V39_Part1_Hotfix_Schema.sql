-- ==============================================================================
-- BODY HARMONY -- V39 HOTFIX: MISSING COLUMNS
-- STATUS: CRITICAL
-- OBJECTIVE: Add security columns for AuthController and ensure photo_url exists
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. Add Security Columns (if they don't exist)
-- We use a stored procedure trick or just run ALTER and ignore "Duplicate column" error (simple way for manual run)
-- But user might prefer a clean script. 
-- 1A. failed_login_attempts
SET @dbname = DATABASE();
SET @tablename = "students";
SET @columnname = "failed_login_attempts";
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE (table_name = @tablename)
                        AND (table_schema = @dbname)
                        AND (column_name = @columnname)
                ) > 0,
                "SELECT 1",
                "ALTER TABLE students ADD COLUMN failed_login_attempts INT DEFAULT 0;"
            )
    );
PREPARE stmt
FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- 1B. locked_until
SET @columnname = "locked_until";
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE (table_name = @tablename)
                        AND (table_schema = @dbname)
                        AND (column_name = @columnname)
                ) > 0,
                "SELECT 1",
                "ALTER TABLE students ADD COLUMN locked_until DATETIME NULL;"
            )
    );
PREPARE stmt
FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- 2. Ensure photo_url exists (Standardization)
-- If it's missing but profile_photo exists, we rename.
-- Check if profile_photo exists
SET @columnname = "profile_photo";
SET @has_profile_photo = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE (table_name = @tablename)
            AND (table_schema = @dbname)
            AND (column_name = @columnname)
    );
-- Check if photo_url exists
SET @columnname = "photo_url";
SET @has_photo_url = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE (table_name = @tablename)
            AND (table_schema = @dbname)
            AND (column_name = @columnname)
    );
-- Logic: 
-- If profile_photo exists AND photo_url does NOT exist -> RENAME
-- IF profile_photo exists AND photo_url exists -> DO NOTHING (Maybe migrate data? assume done)
-- IF profile_photo does NOT exist AND photo_url does NOT exist -> ADD photo_url
SET @sql_stm = CASE
        WHEN @has_profile_photo > 0
        AND @has_photo_url = 0 THEN 'ALTER TABLE students CHANGE profile_photo photo_url VARCHAR(255);'
        WHEN @has_profile_photo = 0
        AND @has_photo_url = 0 THEN 'ALTER TABLE students ADD COLUMN photo_url VARCHAR(255);'
        ELSE 'SELECT 1' -- Already has photo_url
    END;
PREPARE stmt
FROM @sql_stm;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- 3. Audit
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_HOTFIX_V39',
        'CRITICAL',
        'system',
        'Added missing security and legacy columns'
    );