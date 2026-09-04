-- ==============================================================================
-- BODY HARMONY -- V38 STRUCTURE REBUILD NEXUS (2026-02-19)
-- STATUS: CRITICAL RESCUE
-- OBJECTIVE: Restore Missing Tables safely (IF NOT EXISTS) based on Master V36
-- ==============================================================================
SET FOREIGN_KEY_CHECKS = 0;
-- ------------------------------------------------------------------------------
-- 1. CORE USERS & AUTH
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `email` varchar(100) NOT NULL,
    `whatsapp` varchar(20) DEFAULT NULL,
    `password_hash` varchar(255) NOT NULL,
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `last_login_at` datetime DEFAULT NULL,
    `profile_photo` varchar(255) DEFAULT NULL,
    `admin_notes` text DEFAULT NULL,
    `instagram` varchar(50) DEFAULT NULL,
    `cpf` varchar(14) DEFAULT NULL,
    `rg` varchar(20) DEFAULT NULL,
    `address` text DEFAULT NULL,
    `lgpd_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `failed_login_attempts` int(11) DEFAULT 0,
    `locked_until` datetime DEFAULT NULL,
    `force_password_change` tinyint(1) DEFAULT 0,
    `max_devices` int(11) DEFAULT 2,
    `twitter` varchar(255) DEFAULT NULL,
    -- Mantendo legado para evitar erro se existir
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `role` enum('superadmin', 'admin', 'editor') DEFAULT 'admin',
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `admin_sessions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `token` varchar(64) NOT NULL,
    `expires_at` datetime NOT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `token` (`token`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `student_devices` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `device_token` varchar(64) NOT NULL,
    `user_agent` text DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `last_used_at` datetime DEFAULT current_timestamp(),
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`),
    KEY `device_token` (`device_token`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- ------------------------------------------------------------------------------
-- 2. CONFIGURATION & AI CORE
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
    KEY `student_id` (`student_id`)
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
    KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- ------------------------------------------------------------------------------
-- 3. LMS MODULES & PROGRESS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lms_modules` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(100) NOT NULL,
    `description` text DEFAULT NULL,
    `cover_image` varchar(255) DEFAULT NULL,
    `order_index` int(11) DEFAULT 0,
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_lessons` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `module_id` int(11) NOT NULL,
    `title` varchar(150) NOT NULL,
    `description` text DEFAULT NULL,
    `video_type` enum('hostinger', 'youtube', 'vimeo') DEFAULT 'hostinger',
    `video_ref` varchar(255) DEFAULT NULL,
    `file_path` varchar(255) DEFAULT NULL,
    `duration_seconds` int(11) DEFAULT 0,
    `order_index` int(11) DEFAULT 0,
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `module_id` (`module_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_progress` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `lesson_id` int(11) NOT NULL,
    `status` enum('started', 'completed') DEFAULT 'started',
    `progress_percent` int(11) DEFAULT 0,
    `last_position_seconds` int(11) DEFAULT 0,
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`),
    KEY `lesson_id` (`lesson_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_attachments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `lesson_id` int(11) DEFAULT NULL,
    `module_id` int(11) DEFAULT NULL,
    `title` varchar(150) NOT NULL,
    `file_path` varchar(255) NOT NULL,
    `file_type` varchar(20) DEFAULT 'pdf',
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `lesson_id` (`lesson_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- ------------------------------------------------------------------------------
-- 4. GAMIFICATION & LICENSES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lms_licenses` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `license_key` varchar(100) NOT NULL,
    `ai_plan_type` enum('BASIC', 'PRO', 'GOLD') DEFAULT 'BASIC',
    `ai_credits_total` int(11) DEFAULT 10,
    `ai_credits_used` int(11) DEFAULT 0,
    `ai_last_reset` date DEFAULT curdate(),
    `status` enum('active', 'expired', 'cancelled') DEFAULT 'active',
    `expires_at` datetime DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `license_key` (`license_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_licenciada_licenses` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `licenciada_id` int(11) NOT NULL,
    `license_id` int(11) NOT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `licenciada_id` (`licenciada_id`),
    KEY `license_id` (`license_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_badges` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL,
    `description` text DEFAULT NULL,
    `icon_url` varchar(255) DEFAULT NULL,
    `criteria_type` varchar(50) DEFAULT 'manual',
    `criteria_value` int(11) DEFAULT 0,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_user_badges` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `badge_id` int(11) NOT NULL,
    `awarded_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lms_certificates` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `course_name` varchar(100) NOT NULL,
    `certificate_code` varchar(64) NOT NULL,
    `issued_at` timestamp NULL DEFAULT current_timestamp(),
    `pdf_path` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `certificate_code` (`certificate_code`),
    KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- ------------------------------------------------------------------------------
-- 5. SYSTEM AUDIT & LGPD
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
-- ------------------------------------------------------------------------------
-- 6. DATA SEEDING (SAFE)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO site_config (config_key, config_value)
VALUES ('ai_name', 'Doctor Harmony'),
    (
        'ai_persona',
        'Especialista Sênior em Fisiologia'
    ),
    ('forensics_enabled', '1');
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'REBUILD_EXECUTION',
        'CRITICAL',
        'system',
        'Executed V38_Structure_Rebuild_Nexus.sql to restore full schema integrity'
    );
SET FOREIGN_KEY_CHECKS = 1;
-- END OF SCRIPT