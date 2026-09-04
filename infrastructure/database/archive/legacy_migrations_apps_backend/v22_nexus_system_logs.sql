-- apps/web-app/src/backend/migrations/v22_nexus_system_logs.sql
-- Enhance audit_logs with structured details and severity

-- 1. Add 'details' JSON column if not exists
SET @dbname = DATABASE();
SET @tablename = "audit_logs";
SET @columnname = "details";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE audit_logs ADD COLUMN details JSON AFTER description"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add 'severity' column
SET @columnname = "severity";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE audit_logs ADD COLUMN severity VARCHAR(20) DEFAULT 'INFO' AFTER action"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add Index for performance
ALTER TABLE audit_logs ADD INDEX IF NOT EXISTS idx_severity (severity);
ALTER TABLE audit_logs ADD INDEX IF NOT EXISTS idx_user (user_id, user_type);
