-- ==============================================================================
-- BODY HARMONY -- V38 EMERGENCY STRUCTURE RESCUE (2026-02-19)
-- PURPOSE: Restore missing tables safely (IF NOT EXISTS) to allow V38 Migration.
-- EXECUTION: Run this script BEFORE V38_Consolidation_Nexus.sql if tables are missing.
-- ==============================================================================
SET FOREIGN_KEY_CHECKS = 0;
-- 1. CONFIGURATION TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_config` (
    `config_key` varchar(50) NOT NULL,
    `config_value` longtext DEFAULT NULL,
    PRIMARY KEY (`config_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `ai_config` (
    `config_key` varchar(50) NOT NULL,
    `config_value` longtext DEFAULT NULL,
    PRIMARY KEY (`config_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 2. AI & CLINICAL CASE TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_clinical_cases` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `patient_name` varchar(100) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `gender` varchar(20) DEFAULT NULL,
    `complaint` text DEFAULT NULL,
    `history` text DEFAULT NULL,
    `photo_path` varchar(255) DEFAULT NULL,
    `analysis_result` longtext DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `status` enum('pending', 'analyzed', 'error') DEFAULT 'pending',
    `feedback_rate` int(11) DEFAULT NULL,
    `license_id` int(11) DEFAULT NULL,
    `doctor_harmony_response` longtext DEFAULT NULL,
    `mentor_feedback` longtext DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`),
    KEY `license_id` (`license_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `ai_mentorship_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) DEFAULT NULL,
    `license_id` int(11) DEFAULT NULL,
    `action` varchar(50) DEFAULT NULL,
    `context` text DEFAULT NULL,
    `details` longtext DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `resource_id` int(11) DEFAULT 0,
    `file_hash` varchar(64) DEFAULT NULL,
    `geolocation` text DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`),
    KEY `license_id` (`license_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 3. LGPD & COMPLIANCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lgpd_consent_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `term_id` varchar(50) NOT NULL,
    `term_version` varchar(20) NOT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `accepted_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 4. SECURITY & AUDIT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `nexus_security_rules` (
    `rule_key` varchar(50) NOT NULL,
    `rule_value` longtext DEFAULT NULL,
    `description` text DEFAULT NULL,
    `is_active` tinyint(1) DEFAULT 1,
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`rule_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `action` varchar(50) NOT NULL,
    `severity` enum('INFO', 'WARNING', 'CRITICAL') DEFAULT 'INFO',
    `user_type` varchar(20) DEFAULT NULL,
    `user_id` int(11) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `details` longtext DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 5. SEED INITIAL DATA (If Tables Were Empty)
-- ------------------------------------------------------------------------------
-- Only insert if not exists to avoid duplicates
INSERT IGNORE INTO site_config (config_key, config_value)
VALUES ('ai_name', 'Doctor Harmony'),
    (
        'ai_persona',
        'Especialista Sênior em Fisiologia'
    ),
    ('forensics_enabled', '1');
-- Audit Log for Rescue Operation
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'EMERGENCY_RESCUE',
        'WARNING',
        'system',
        'Executed V38_Emergency_Structure.sql to restore schema integrity'
    );
SET FOREIGN_KEY_CHECKS = 1;