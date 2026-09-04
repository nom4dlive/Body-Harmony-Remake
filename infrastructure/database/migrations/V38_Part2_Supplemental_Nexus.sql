-- ==============================================================================
-- BODY HARMONY -- V38 PART 2: SUPPLEMENTAL STRUCTURE FIX (2026-02-19)
-- STATUS: CRITICAL - Fixes 500 Errors in Admin Panel
-- OBJECTIVE: Create missing auxiliary tables and patch columns in AI tables.
-- ==============================================================================
-- FIX: Ensure database selection
USE u388974772_bodyharmony_db;
-- SET FOREIGN_KEY_CHECKS = 0;
-- ------------------------------------------------------------------------------
-- 1. MISSING AUXILIARY TABLES
-- ------------------------------------------------------------------------------
-- Table: faq
CREATE TABLE IF NOT EXISTS `faq` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `question` text NOT NULL,
    `answer` text NOT NULL,
    `display_order` int(11) DEFAULT 0,
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: system_broadcasts
CREATE TABLE IF NOT EXISTS `system_broadcasts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(150) DEFAULT NULL,
    `message` text NOT NULL,
    `type` enum('info', 'warning', 'alert') DEFAULT 'info',
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_access_logs
CREATE TABLE IF NOT EXISTS `lms_access_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) DEFAULT NULL,
    `admin_id` int(11) DEFAULT NULL,
    `user_type` enum('student', 'admin', 'system') NOT NULL,
    `action` varchar(50) NOT NULL,
    `target_resource` varchar(100) DEFAULT NULL,
    `details` text DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_lms_log_student` (`student_id`),
    KEY `idx_lms_log_admin` (`admin_id`),
    KEY `idx_lms_log_type` (`user_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: script_executions
CREATE TABLE IF NOT EXISTS `script_executions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `script_id` varchar(100) NOT NULL,
    `executed_by` int(11) NOT NULL,
    `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `output` text DEFAULT NULL,
    `status` enum('running', 'success', 'error') NOT NULL DEFAULT 'running',
    `error_message` text DEFAULT NULL,
    `executed_at` timestamp NULL DEFAULT current_timestamp(),
    `completed_at` timestamp NULL DEFAULT NULL,
    `duration_ms` int(11) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_script_id` (`script_id`),
    KEY `idx_executed_by` (`executed_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: media_files (Often missing)
CREATE TABLE IF NOT EXISTS `media_files` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `file_path` varchar(500) NOT NULL,
    `file_name` varchar(255) NOT NULL,
    `file_type` varchar(100) NOT NULL,
    `file_size` bigint(20) NOT NULL,
    `media_category` enum(
        'thumbnail',
        'lesson',
        'resource',
        'profile',
        'other'
    ) NOT NULL,
    `width` int(11) DEFAULT NULL,
    `height` int(11) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `last_accessed` timestamp NULL DEFAULT NULL,
    `access_count` int(11) DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `file_path` (`file_path`),
    KEY `idx_category` (`media_category`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ------------------------------------------------------------------------------
-- 2. COLUMN PATCHES (Safe ALTERs)
-- ------------------------------------------------------------------------------
-- Ensure 'ai_clinical_cases' has all V38 columns
-- We use a simple trick: Duplicate column Add attempt (MySQL ignores duplicates on ADD COLUMN sometimes or throws error, 
-- but since we can't use IF NOT EXISTS in ALTER easily in older MySQL without PROCEDURE, 
-- we will use a loose approach or just try adding them. 
-- BETTER APPROACH: We just CREATE IF NOT EXISTS the table with full columns first (above/done).
-- Since table MIGHT exist but lack columns, strict SQL is harder.
-- We will assume they might fail if column exists, so user might see errors but ignoring them is safer than complex logic in PHPMyAdmin.
-- ACTUALLY, let's use the PROCEDURE pattern again but simplified, OR assume user can run line by line.
-- To be safe given the environment issues, let's try direct ADD. If it fails "Duplicate column", that's fine.
-- Patch: ai_clinical_cases
ALTER TABLE `ai_clinical_cases`
ADD COLUMN IF NOT EXISTS `needs_review` tinyint(1) DEFAULT 0;
ALTER TABLE `ai_clinical_cases`
ADD COLUMN IF NOT EXISTS `mentor_feedback` text DEFAULT NULL;
ALTER TABLE `ai_clinical_cases`
ADD COLUMN IF NOT EXISTS `doctor_harmony_response` text DEFAULT NULL;
-- MariaDB 10.2+ supports IF NOT EXISTS in ADD COLUMN. Hostinger uses 10.5+ typically.
-- Patch: ai_mentorship_logs
ALTER TABLE `ai_mentorship_logs`
ADD COLUMN IF NOT EXISTS `interaction_type` enum(
        'TEXT',
        'VISION',
        'DOWNLOAD_RAW',
        'DOWNLOAD_PROTECTED',
        'WIDGET_EVENT'
    ) NOT NULL DEFAULT 'TEXT';
ALTER TABLE `ai_mentorship_logs`
ADD COLUMN IF NOT EXISTS `resource_id` int(11) DEFAULT NULL;
ALTER TABLE `ai_mentorship_logs`
ADD COLUMN IF NOT EXISTS `file_hash` varchar(64) DEFAULT NULL;
-- Patch: students (ensure lgpd cache and V38 features)
ALTER TABLE `students`
ADD COLUMN IF NOT EXISTS `lgpd_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL;
ALTER TABLE `students`
ADD COLUMN IF NOT EXISTS `pinned` tinyint(1) DEFAULT 0;
ALTER TABLE `students`
ADD COLUMN IF NOT EXISTS `mini_gallery` text DEFAULT NULL;
ALTER TABLE `students`
ADD COLUMN IF NOT EXISTS `video_url` varchar(255) DEFAULT NULL;
ALTER TABLE `students`
ADD COLUMN IF NOT EXISTS `instagram_embed_url` varchar(255) DEFAULT NULL;
-- ------------------------------------------------------------------------------
-- 3. AUDIT
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_PATCH',
        'INFO',
        'system',
        'Executed V38_Part2_Supplemental_Nexus.sql'
    );
-- SET FOREIGN_KEY_CHECKS = 1;