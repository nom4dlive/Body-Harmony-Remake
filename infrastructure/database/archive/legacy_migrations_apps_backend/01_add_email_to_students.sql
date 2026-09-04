-- Migration: Add email column to students table (Idempotent)
-- Created: 2026-02-07
-- Using PREPARE because DELIMITER is tricky in docker exec pipes

SET @dbname = DATABASE();

SET @tablename = "students";

SET @columnname = "email";

SET
    @sql_query = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE
                        table_name = @tablename
                        AND table_schema = @dbname
                        AND column_name = @columnname
                ) > 0, "SELECT 'Column email already exists' as status", "ALTER TABLE students ADD COLUMN email VARCHAR(100) AFTER whatsapp"
            )
    );

PREPARE stmt FROM @sql_query;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;