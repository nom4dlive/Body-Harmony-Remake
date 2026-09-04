-- V36 Migration - LGPD Foundation (2026-02-18)
-- Reference: openspec/deltas/PLAN-LGPD-Full-Stack.md

-- FIX: Ensure database selection for manual imports
USE u388974772_bodyharmony_db;

-- 1. Create Consent Logs Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS lgpd_consent_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    consent_version VARCHAR(20) NOT NULL COMMENT 'e.g., v1.0, v1.1',
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    policy_type ENUM('terms', 'privacy', 'data_processing', 'ai_usage') NOT NULL,
    action ENUM('accepted', 'revoked') NOT NULL,
    accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME NULL,
    meta_data JSON NULL COMMENT 'Contexto adicional (device, location)',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_lgpd_student ON lgpd_consent_logs(student_id);
CREATE INDEX idx_lgpd_action ON lgpd_consent_logs(action);

-- 2. Add LGPD Status Cache to Students Table
-- This avoids querying log history on every request. Stores critical flags like {ai_usage: true}.
SET @col_exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'lgpd_status');
SET @alter_sql = IF(@col_exists > 0, 'SELECT 1', 'ALTER TABLE students ADD COLUMN lgpd_status JSON DEFAULT NULL');
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
