-- ==============================================================================
-- BODY HARMONY -- V45 SCHEMA CONSOLIDATION (2026-02-20)
-- STATUS: PRODUCTION SYNC
-- OBJECTIVE: Fix LMS, LGPD, and Audit Log inconsistencies
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. FIX audit_logs (Missing ip_address and ERROR severity)
ALTER TABLE audit_logs
ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL
AFTER user_type,
    MODIFY COLUMN severity ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL') DEFAULT 'INFO';
-- 2. FIX lms_lessons (Missing thumbnail and audit columns)
ALTER TABLE lms_lessons
ADD COLUMN thumbnail_ref VARCHAR(255) DEFAULT NULL
AFTER file_path,
    ADD COLUMN thumbnail_base64 LONGTEXT DEFAULT NULL
AFTER thumbnail_ref,
    ADD COLUMN last_modified_by INT(11) DEFAULT NULL
AFTER is_active,
    ADD COLUMN last_modified_at TIMESTAMP NULL DEFAULT NULL
AFTER last_modified_by;
-- 3. CREATE lms_resources TABLE
CREATE TABLE IF NOT EXISTS lms_resources (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_type VARCHAR(50),
    file_path VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_active TINYINT(1) DEFAULT 1,
    approved_by INT(11),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- 4. CREATE lms_resource_access TABLE
CREATE TABLE IF NOT EXISTS lms_resource_access (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    resource_id INT(11) NOT NULL,
    student_id INT(11) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_res (resource_id),
    KEY idx_stu (student_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- 5. FIX lgpd_consent_logs (Ensure columns match controller expectations)
-- The table exists but might have different column names or constraints
-- We'll add missing columns if they don't exist
-- Based on diagnose: it has accepted_at, we might need to unify or add created_at
ALTER TABLE lgpd_consent_logs
MODIFY COLUMN consent_version VARCHAR(20) DEFAULT 'v1.0',
    MODIFY COLUMN ip_address VARCHAR(45) DEFAULT '0.0.0.0',
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
AFTER meta_data;
-- 6. AUDIT ENTRY
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_SYNC_V45',
        'INFO',
        'system',
        'Consolidated LMS, LGPD, and Audit Log schemas.'
    );