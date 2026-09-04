-- ==============================================================================
-- BODY HARMONY -- FULL DATABASE RESET V68 (2026-03-02)
-- CONSOLIDATED SCHEMA: V34...V67 + V68 (Portal Aluna Individual)
-- WARNING: THIS SCRIPT DROPS TABLES. USE WITH CAUTION.
-- FIX: Ensure database selection
USE u388974772_bodyharmony_db;
-- SET FOREIGN_KEY_CHECKS = 0; -- Optional: Uncomment if needed for resets
-- FULL DATABASE RESET V34 (2024-05-20)
-- ==============================================================================
-- Version: 34.0.0 (Consolidated)
-- Date: 2026-02-17
-- Description: 
--    Master reset script that wipes the database and rebuilds it from the 
--    Hostinger Production Backup (v33-state) + V34 Doctor Harmony Config.
--    Includes all tables, constraints, and seeds (Admin, Config, 38 Students).
-- ==============================================================================
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
-- ==============================================================================
-- 1. DROP EXISTING TABLES
-- ==============================================================================
DROP TABLE IF EXISTS `admin_nudges`;
DROP TABLE IF EXISTS `admin_sessions`;
DROP TABLE IF EXISTS `admin_users`;
DROP TABLE IF EXISTS `ai_clinical_cases`;
DROP TABLE IF EXISTS `ai_config`;
DROP TABLE IF EXISTS `ai_mentorship_logs`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `auth_logs`;
DROP TABLE IF EXISTS `faq`;
DROP TABLE IF EXISTS `gallery_images`;
DROP TABLE IF EXISTS `leads`;
DROP TABLE IF EXISTS `lms_access_logs`;
DROP TABLE IF EXISTS `lms_attachments`;
DROP TABLE IF EXISTS `lms_badges`;
DROP TABLE IF EXISTS `lms_certificates`;
DROP TABLE IF EXISTS `lms_lessons`;
DROP TABLE IF EXISTS `lms_modules`;
DROP TABLE IF EXISTS `lms_points_log`;
DROP TABLE IF EXISTS `lms_progress`;
DROP TABLE IF EXISTS `lms_questions`;
DROP TABLE IF EXISTS `lms_question_options`;
DROP TABLE IF EXISTS `lms_quizzes`;
DROP TABLE IF EXISTS `lms_quiz_attempts`;
DROP TABLE IF EXISTS `lms_resources`;
DROP TABLE IF EXISTS `lms_resource_access`;
DROP TABLE IF EXISTS `lms_user_badges`;
DROP TABLE IF EXISTS `media_files`;
DROP TABLE IF EXISTS `mentors`;
DROP TABLE IF EXISTS `nexus_security_rules`;
DROP TABLE IF EXISTS `results`;
DROP TABLE IF EXISTS `script_executions`;
DROP TABLE IF EXISTS `site_config`;
DROP TABLE IF EXISTS `licenciadas`;
DROP TABLE IF EXISTS `student_devices`;
DROP TABLE IF EXISTS `system_broadcasts`;
DROP TABLE IF EXISTS `system_broadcast_logs`;
DROP TABLE IF EXISTS `testimonials`;
-- V68 Aluna Individual Tables
DROP TABLE IF EXISTS `aluna_certificates`;
DROP TABLE IF EXISTS `aluna_progress`;
DROP TABLE IF EXISTS `aluna_course_access`;
DROP TABLE IF EXISTS `aluna_devices`;
DROP TABLE IF EXISTS `alunas`;
-- ==============================================================================
-- 2. CREATE TABLE STRUCTURES
-- ==============================================================================
-- Table: admin_nudges
CREATE TABLE `admin_nudges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `type` enum('alert', 'reminder', 'encouragement') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: admin_sessions
CREATE TABLE `admin_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: admin_users
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superadmin', 'admin', 'editor') DEFAULT 'admin',
  `lgpd_status` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: ai_clinical_cases
CREATE TABLE `ai_clinical_cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `license_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `case_title` varchar(255) DEFAULT 'Caso Clínico',
  `case_description` text DEFAULT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `complaint` text DEFAULT NULL,
  `history` text DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `ana_response` text DEFAULT NULL,
  `doctor_harmony_response` longtext DEFAULT NULL,
  `analysis_result` longtext DEFAULT NULL,
  `confidence_score` float DEFAULT 0,
  `needs_review` tinyint(1) DEFAULT 0,
  `mentor_feedback` longtext DEFAULT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `feedback_rate` int(11) DEFAULT NULL,
  `status` enum(
    'PENDING',
    'ANALYZED',
    'REVIEWED',
    'REJECTED',
    'error'
  ) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `license_id` (`license_id`),
  KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: ai_config
CREATE TABLE `ai_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ai_config_key` (`config_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: ai_mentorship_logs (Consolidated V36)
CREATE TABLE `ai_mentorship_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `license_id` int(11) NOT NULL,
  `interaction_type` enum(
    'TEXT',
    'VISION',
    'DOWNLOAD_RAW',
    'DOWNLOAD_PROTECTED',
    'WIDGET_EVENT'
  ) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `resource_id` int(11) DEFAULT NULL COMMENT 'ID do recurso baixado',
  `file_hash` varchar(64) DEFAULT NULL COMMENT 'SHA-256 do arquivo gerado',
  `ip_address` varchar(45) DEFAULT NULL,
  `geolocation` varchar(100) DEFAULT NULL,
  `prompt_tokens` int(11) DEFAULT 0,
  `completion_tokens` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `license_id` (`license_id`),
  KEY `idx_audit_resource` (`resource_id`),
  KEY `idx_audit_hash` (`file_hash`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: audit_logs
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_type` enum('admin', 'student', 'system') NOT NULL,
  `action` varchar(50) NOT NULL,
  `severity` varchar(20) DEFAULT 'INFO',
  `description` text DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_user` (`user_id`, `user_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: auth_logs
CREATE TABLE `auth_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `success` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_auth_logs_email` (`email`),
  KEY `idx_auth_logs_ip` (`ip_address`),
  KEY `idx_auth_logs_created` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: faq
CREATE TABLE `faq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: gallery_images
CREATE TABLE `gallery_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `category` varchar(50) DEFAULT 'General',
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: leads
CREATE TABLE `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `status` enum('new', 'contacted', 'converted', 'archived') DEFAULT 'new',
  `source` varchar(50) DEFAULT 'site',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_access_logs
CREATE TABLE `lms_access_logs` (
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
-- Table: lms_attachments
CREATE TABLE `lms_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL,
  `type` enum('pdf', 'doc', 'link', 'image') NOT NULL,
  `title` varchar(150) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_badges
CREATE TABLE `lms_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `criteria_json` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_certificates
CREATE TABLE `lms_certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `hash_code` varchar(64) NOT NULL,
  `issued_at` timestamp NULL DEFAULT current_timestamp(),
  `pdf_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_module` (`student_id`, `module_id`),
  UNIQUE KEY `hash_code` (`hash_code`),
  KEY `fk_cert_module` (`module_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_lessons
CREATE TABLE `lms_lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `video_type` enum('youtube', 'vimeo', 'mp4', 'bunny', 'hostinger') DEFAULT 'youtube',
  `video_url` varchar(255) DEFAULT NULL,
  `duration_seconds` int(11) DEFAULT 0,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `hls_path` varchar(255) DEFAULT NULL COMMENT 'Path relat. ao master.m3u8 (V84)',
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `allow_preview` tinyint(1) DEFAULT 0,
  `points_reward` int(11) DEFAULT 10,
  `views_count` int(11) DEFAULT 0,
  `last_modified_by` int(11) DEFAULT NULL,
  `last_modified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`),
  KEY `idx_les_audit` (`last_modified_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_modules
CREATE TABLE `lms_modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `last_modified_by` int(11) DEFAULT NULL,
  `last_modified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mod_audit` (`last_modified_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_points_log
CREATE TABLE `lms_points_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `points` int(11) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_points_idx` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_progress
CREATE TABLE `lms_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `progress_percent` int(11) DEFAULT 0,
  `total_duration` int(11) DEFAULT 0,
  `watched_duration` int(11) DEFAULT 0,
  `completion_date` timestamp NULL DEFAULT NULL,
  `last_watched_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson` (`student_id`, `lesson_id`),
  KEY `fk_progress_lesson` (`lesson_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_questions
CREATE TABLE `lms_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `type` enum('single', 'multiple', 'text') DEFAULT 'single',
  `order_index` int(11) DEFAULT 0,
  `image_ref` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_question_options
CREATE TABLE `lms_question_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_quizzes
CREATE TABLE `lms_quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `min_score` int(11) DEFAULT 70,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_quiz_attempts
CREATE TABLE `lms_quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `score` decimal(5, 2) DEFAULT 0.00,
  `passed` tinyint(1) DEFAULT 0,
  `answers_json` longtext DEFAULT NULL,
  `attempted_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `quiz_id` (`quiz_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_resources
CREATE TABLE `lms_resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `file_type` varchar(20) DEFAULT 'pdf',
  `size_bytes` bigint(20) DEFAULT 0,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'approved',
  `category` enum(
    'manual',
    'evaluation',
    'marketing',
    'template',
    'other'
  ) DEFAULT 'other',
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_res_creator` (`created_by`),
  KEY `fk_res_approver` (`approved_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_resource_access
CREATE TABLE `lms_resource_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `granted_at` datetime DEFAULT current_timestamp(),
  `granted_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `resource_id` (`resource_id`, `student_id`),
  KEY `student_id` (`student_id`),
  KEY `granted_by` (`granted_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: lms_user_badges
CREATE TABLE `lms_user_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `awarded_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_badge_unique` (`user_id`, `badge_id`),
  KEY `fk_badge_def` (`badge_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: media_files
CREATE TABLE `media_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_path` varchar(500) NOT NULL COMMENT 'Relative path from private_uploads/',
  `file_name` varchar(255) NOT NULL COMMENT 'Original filename',
  `file_type` varchar(100) NOT NULL COMMENT 'MIME type',
  `file_size` bigint(20) NOT NULL COMMENT 'Size in bytes',
  `media_category` enum(
    'thumbnail',
    'lesson',
    'resource',
    'profile',
    'other'
  ) NOT NULL COMMENT 'Type of media',
  `width` int(11) DEFAULT NULL COMMENT 'Image width in pixels',
  `height` int(11) DEFAULT NULL COMMENT 'Image height in pixels',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `last_accessed` timestamp NULL DEFAULT NULL COMMENT 'Last time file was used',
  `access_count` int(11) DEFAULT 0 COMMENT 'Number of times file was reused',
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_path` (`file_path`),
  KEY `idx_category` (`media_category`),
  KEY `idx_created` (`created_at`),
  KEY `idx_path` (`file_path`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Tracks media files in private_uploads for reuse system';
-- Table: mentors
CREATE TABLE `mentors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `instagram` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: nexus_security_rules (V33)
CREATE TABLE `nexus_security_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rule_key` varchar(50) NOT NULL COMMENT 'Chave única da regra (ex: MAX_LOGIN_ATTEMPTS)',
  `rule_value` text DEFAULT NULL COMMENT 'Valor da regra (pode ser JSON)',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descrição human-readable',
  `is_active` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'ID do admin que alterou',
  PRIMARY KEY (`id`),
  UNIQUE KEY `rule_key` (`rule_key`),
  KEY `updated_by` (`updated_by`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: results
CREATE TABLE `results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `category` varchar(50) DEFAULT 'Gordura Localizada',
  `image_url` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `pinned` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: script_executions
CREATE TABLE `script_executions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `script_id` varchar(100) NOT NULL COMMENT 'Script identifier (e.g., sync-media-files)',
  `executed_by` int(11) NOT NULL COMMENT 'Admin ID who executed the script',
  `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Parameters passed to the script' CHECK (json_valid(`params`)),
  `result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Execution result/statistics' CHECK (json_valid(`result`)),
  `output` text DEFAULT NULL COMMENT 'Script output/logs',
  `status` enum('running', 'success', 'error') NOT NULL DEFAULT 'running' COMMENT 'Execution status',
  `error_message` text DEFAULT NULL COMMENT 'Error message if status is error',
  `executed_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'When execution started',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'When execution completed',
  `duration_ms` int(11) DEFAULT NULL COMMENT 'Execution duration in milliseconds',
  PRIMARY KEY (`id`),
  KEY `idx_script_id` (`script_id`),
  KEY `idx_executed_by` (`executed_by`),
  KEY `idx_status` (`status`),
  KEY `idx_executed_at` (`executed_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Audit trail for script executions via Nexus Scripts Manager';
-- Table: site_config
CREATE TABLE `site_config` (
  `config_key` varchar(50) NOT NULL,
  `config_value` longtext DEFAULT NULL,
  PRIMARY KEY (`config_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- ==============================================================================
-- V68: PORTAL ALUNA INDIVIDUAL
-- ==============================================================================

-- Table: alunas
CREATE TABLE `alunas` (
    `id`                    INT(11)      NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(100) NOT NULL,
    `email`                 VARCHAR(100) NOT NULL,
    `cpf`                   VARCHAR(14)  NULL,
    `password_hash`         VARCHAR(255) NOT NULL,
    `is_active`             TINYINT(1)   DEFAULT 1,
    `force_password_change` TINYINT(1)   DEFAULT 0,
    `failed_login_attempts` TINYINT(4)   DEFAULT 0,
    `locked_until`          DATETIME     NULL,
    `last_login_at`         DATETIME     NULL,
    `max_devices`           INT(11)      DEFAULT 1,
    `admin_notes`           TEXT         NULL,
    `lgpd_status`           TEXT         NULL,
    `created_at`            TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_aluna_email` (`email`),
    UNIQUE KEY `uq_aluna_cpf`   (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: aluna_devices
CREATE TABLE `aluna_devices` (
    `id`               INT(11)      NOT NULL AUTO_INCREMENT,
    `aluna_id`         INT(11)      NOT NULL,
    `device_token`     VARCHAR(64)  NOT NULL,
    `user_agent`       VARCHAR(255) NULL,
    `ip_address`       VARCHAR(45)  NULL,
    `is_active`        TINYINT(1)   DEFAULT 1,
    `fingerprint_hash` VARCHAR(64)  NULL,
    `created_at`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
    `last_used_at`     TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_aluna_device_token` (`device_token`),
    KEY `idx_aluna_devices_aluna_id` (`aluna_id`),
    KEY `idx_aluna_devices_fingerprint` (`fingerprint_hash`),
    CONSTRAINT `fk_aluna_device_aluna`
        FOREIGN KEY (`aluna_id`) REFERENCES `alunas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: aluna_course_access
CREATE TABLE `aluna_course_access` (
    `id`          INT(11)  NOT NULL AUTO_INCREMENT,
    `aluna_id`    INT(11)  NOT NULL,
    `module_id`   INT(11)  NOT NULL,
    `granted_at`  DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `granted_by`  INT(11)  NULL,
    `expires_at`  DATETIME NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_aluna_module_access` (`aluna_id`, `module_id`),
    KEY `idx_aluna_access_aluna`  (`aluna_id`),
    KEY `idx_aluna_access_module` (`module_id`),
    CONSTRAINT `fk_aluna_access_aluna`
        FOREIGN KEY (`aluna_id`)  REFERENCES `alunas`(`id`)       ON DELETE CASCADE,
    CONSTRAINT `fk_aluna_access_module`
        FOREIGN KEY (`module_id`) REFERENCES `lms_modules`(`id`)  ON DELETE CASCADE,
    CONSTRAINT `fk_aluna_access_admin`
        FOREIGN KEY (`granted_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: aluna_progress
CREATE TABLE `aluna_progress` (
    `id`               INT(11)        NOT NULL AUTO_INCREMENT,
    `aluna_id`         INT(11)        NOT NULL,
    `lesson_id`        INT(11)        NOT NULL,
    `is_completed`     TINYINT(1)     DEFAULT 0,
    `progress_percent` INT(11)        DEFAULT 0,
    `watched_duration` INT(11)        DEFAULT 0,
    `completion_date`  TIMESTAMP      NULL,
    `last_watched_at`  TIMESTAMP      NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_aluna_progress` (`aluna_id`, `lesson_id`),
    KEY `idx_aluna_progress_lesson` (`lesson_id`),
    CONSTRAINT `fk_aluna_progress_aluna`
        FOREIGN KEY (`aluna_id`)  REFERENCES `alunas`(`id`)       ON DELETE CASCADE,
    CONSTRAINT `fk_aluna_progress_lesson`
        FOREIGN KEY (`lesson_id`) REFERENCES `lms_lessons`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: aluna_certificates
CREATE TABLE `aluna_certificates` (
    `id`        INT(11)      NOT NULL AUTO_INCREMENT,
    `aluna_id`  INT(11)      NOT NULL,
    `module_id` INT(11)      NOT NULL,
    `hash_code` VARCHAR(64)  NOT NULL,
    `issued_at` TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
    `pdf_url`   VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_aluna_cert` (`aluna_id`, `module_id`),
    UNIQUE KEY `uq_aluna_cert_hash` (`hash_code`),
    KEY `idx_aluna_cert_module` (`module_id`),
    CONSTRAINT `fk_aluna_cert_aluna`
        FOREIGN KEY (`aluna_id`)  REFERENCES `alunas`(`id`)       ON DELETE CASCADE,
    CONSTRAINT `fk_aluna_cert_module`
        FOREIGN KEY (`module_id`) REFERENCES `lms_modules`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Table: licenciadas
CREATE TABLE `licenciadas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `state` varchar(10) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `instagram` varchar(50) DEFAULT NULL,
  `instagram_embed_url` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `force_password_change` tinyint(1) DEFAULT 0,
  `video_url` varchar(255) DEFAULT NULL,
  `mini_gallery` text DEFAULT NULL,
  `pinned` tinyint(1) DEFAULT 0,
  `max_devices` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `failed_login_attempts` tinyint(4) DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `last_active_lesson_id` int(11) DEFAULT NULL,
  `last_watched_at` timestamp NULL DEFAULT NULL,
  `progress_percent` decimal(5, 2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `renewal_date` date DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_students_renewal` (`renewal_date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Table: student_devices
CREATE TABLE `student_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `device_token` varchar(64) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `device_token` (`device_token`),
  KEY `student_id` (`student_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: system_broadcasts
CREATE TABLE `system_broadcasts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('info', 'warning', 'alert') DEFAULT 'info',
  `target_roles` text DEFAULT NULL COMMENT 'JSON array of roles like ["admin", "licenciada"]',
  `target_levels` text DEFAULT NULL COMMENT 'JSON array of levels like ["standard", "platinum"]',
  `is_blocking` tinyint(1) DEFAULT 0 COMMENT 'If 1, user must acknowledge before continuing',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: system_broadcast_logs
CREATE TABLE `system_broadcast_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `broadcast_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('admin', 'licenciada') NOT NULL,
  `read_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sb_broadcast` (`broadcast_id`),
  KEY `idx_sb_user` (`user_id`, `user_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- Table: testimonials
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `text` text NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- ==============================================================================
-- 3. SEED DATA
-- ==============================================================================
-- Admin Users
INSERT INTO `admin_users` (
    `id`,
    `username`,
    `password_hash`,
    `role`,
    `created_at`
  )
VALUES (
    1,
    'bodyharmony',
    '$2y$10$wTf7oGv.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
    'superadmin',
    '2026-02-06 04:31:11'
  ),
  (
    2,
    'admin_josi',
    '$2y$10$wTf7oGv.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
    'admin',
    '2026-02-06 04:31:11'
  ),
  (
    5,
    'dev_nomad',
    '$2y$10$wTf7oGv.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
    'admin',
    '2026-02-06 04:31:11'
  );
-- LMS Modules & Lessons (Basic structure)
INSERT INTO `lms_modules` (
    `id`,
    `title`,
    `description`,
    `thumbnail_url`,
    `display_order`,
    `is_active`,
    `last_modified_by`,
    `last_modified_at`,
    `created_at`
  )
VALUES (
    15,
    'Introdução ao Body Harmony',
    'Boas-vindas e visão geral do método.',
    NULL,
    0,
    1,
    2,
    '2026-02-10 15:43:08',
    '2026-02-06 10:55:17'
  ),
  (
    16,
    'Fundamentos da Eletroestimulação',
    'A base científica e prática.',
    NULL,
    4,
    1,
    NULL,
    NULL,
    '2026-02-06 10:55:17'
  ),
  (
    17,
    'Interpretação de exames - DR ULISSES LOPES ',
    'Aulas com Dr Ulisses medico, fundador do Body harmony.',
    NULL,
    1,
    1,
    2,
    '2026-02-10 15:27:00',
    '2026-02-06 10:55:17'
  ),
  (
    19,
    'EletroFace -Aula teórica e fundamentos',
    'O eletro face é uma técnica exclusiva.',
    NULL,
    2,
    1,
    NULL,
    NULL,
    '2026-02-10 11:22:32'
  ),
  (
    20,
    'Negocios /marketing ',
    'Aqui falamos como gerar caixa rápido.',
    NULL,
    3,
    1,
    NULL,
    NULL,
    '2026-02-10 22:18:11'
  ),
  (
    21,
    'Aulas Praticas',
    '',
    NULL,
    0,
    1,
    NULL,
    NULL,
    '2026-02-14 15:05:41'
  );
INSERT INTO `lms_lessons` (
    `id`,
    `module_id`,
    `title`,
    `description`,
    `video_type`,
    `video_url`,
    `thumbnail_url`,
    `file_path`,
    `display_order`,
    `is_active`
  )
VALUES (
    25,
    15,
    'Boas vindas ao Body harmony - Josi Silva',
    'Sejam bem-vindas!',
    'hostinger',
    '1770529574_Sejam_bem_vindas_(1).mp4',
    '1770529574_Sejam_bem_vindas_(1).mp4',
    '1770529574_Sejam_bem_vindas_(1).mp4',
    0,
    1
  ),
  (
    26,
    17,
    'Fisiologia hormonal - Introdução',
    'Introdução à aula de fisiologia hormonal com Dr. Ulisses.',
    'hostinger',
    '1770669224_Fisiologia_Hormonal.mp4',
    NULL,
    '1770669224_Fisiologia_Hormonal.mp4',
    2,
    1
  ),
  (
    38,
    16,
    'Eletroestimulação e seus conceitos',
    'O que é?\n• Hertz\n• Frequência\n• Largura de pulso\n• Burst',
    'hostinger',
    '1771100244_video-output-6C77339F-E99F-4E69-A2FC-3B2D30AC4C63-1.mov',
    NULL,
    '1771100244_video-output-6C77339F-E99F-4E69-A2FC-3B2D30AC4C63-1.mov',
    0,
    1
  );
-- Mentors
INSERT INTO `mentors` (
    `id`,
    `name`,
    `nickname`,
    `role`,
    `photo_url`,
    `bio`,
    `instagram`,
    `created_at`
  )
VALUES (
    1,
    'Joselene A. Silva',
    'Josi',
    'Co-Fundadora do Método',
    '/mentors/josi.png',
    'Nutricionista, esteticista, especialista em eletroestimulação e graduanda em biomedicina.',
    '@bodyharmony',
    '2026-02-06 04:31:11'
  ),
  (
    3,
    'Kaprice Gonçalves',
    'Kaprice',
    'Educadora Física',
    '/mentors/Kaprice.png',
    'Educadora física.',
    '@kaprice_meirelles',
    '2026-02-06 04:31:11'
  );
-- Nexus Security Rules (V33)
INSERT INTO `nexus_security_rules` (
    `id`,
    `rule_key`,
    `rule_value`,
    `description`,
    `is_active`,
    `updated_at`,
    `updated_by`
  )
VALUES (
    1,
    'MAX_LOGIN_ATTEMPTS',
    '3',
    'Número máximo de tentativas de login antes do bloqueio temporário',
    1,
    '2026-02-12 01:29:38',
    5
  ),
  (
    2,
    'LOCKOUT_DURATION_MINUTES',
    '15',
    'Tempo de bloqueio em minutos após exceder tentativas',
    1,
    '2026-02-11 19:30:17',
    5
  ),
  (
    3,
    'WHITELIST_IPS',
    '[\"127.0.0.1\",\"::1\",\"2804:4fe4:71:afa0:a0b6:d69:93f2:5519\",\"191.179.140.85\",\"191.26.152.90\",\"2804:18:194b:1e6d:35b3:178c:d83f:7345\"]',
    'Lista de IPs permitidos para bypass (JSON)',
    1,
    '2026-02-11 19:33:54',
    5
  ),
  (
    4,
    'BLACKLIST_IPS',
    '[]',
    'Banned IPs',
    1,
    '2026-02-11 19:30:17',
    5
  ),
  (
    5,
    'ALLOW_REGISTRATION',
    '',
    'Permitir novos cadastros públicos de licenciadas',
    1,
    '2026-02-12 01:29:38',
    5
  );
-- Site Configurations (Combined V33 Backup + V34 Updates)
INSERT INTO `site_config` (`config_key`, `config_value`)
VALUES ('ai_name', 'Doctor Harmony'),
  (
    'ai_slogan',
    'Sua mentora técnica em fisiologia estética.'
  ),
  (
    'course_topics',
    '[\n    {\"id\": \"1\", \"title\": \"Fundamentos da Medicina Integrativa e Metabolismo\"},\n    {\"id\": \"2\", \"title\": \"Técnicas Avançadas de Eletroestimulação\"},\n    {\"id\": \"3\", \"title\": \"Interpretação de Exames e Protocolos Personalizados\"},\n    {\"id\": \"4\", \"title\": \"Gestão e Marketing para Clínicas\"},\n    {\"id\": \"5\", \"title\": \"Práticas com Equipamentos (HTM e outros)\"}\n]'
  ),
  (
    'seo',
    '{\"defaultTitle\":\"Body Harmony - Remodelação Corporal\",\"titleSuffix\":\"Body Harmony\",\"description\":\"Transforme sua carreira com o método Body Harmony. Cursos e mentorias para esteticistas e profissionais da saúde.\",\"keywords\":\"estética, remodelação corporal, curso estética, body harmony\"}'
  ),
  (
    'site_benefits',
    '[{\"id\":\"1\",\"title\":\"Emagrecimento\",\"icon\":\"FaWeight\"},{\"id\":\"2\",\"title\":\"Ganho de Massa Muscular\",\"icon\":\"FaDumbbell\"},{\"id\":\"3\",\"title\":\"Diminuição da Gordura Corporal\",\"icon\":\"FaFire\"},{\"id\":\"4\",\"title\":\"Flacidez\",\"icon\":\"FaSpa\"},{\"id\":\"5\",\"title\":\"Tratamento de Celulites\",\"icon\":\"FaHandSparkles\"},{\"id\":\"6\",\"title\":\"Fibromialgia\",\"icon\":\"FaHeartbeat\"},{\"id\":\"7\",\"title\":\"Diabetes Tipo 2\",\"icon\":\"FaSyringe\"},{\"id\":\"8\",\"title\":\"Sarcopenia\",\"icon\":\"FaBone\"},{\"id\":\"9\",\"title\":\"Incontinência Urinária\",\"icon\":\"FaShieldAlt\"}]'
  ),
  (
    'site_features',
    '[\n    {\"id\": \"1\", \"title\": \"Alta Performance\", \"icon\": \"FaFire\", \"text\": \"Treino que leva a musculatura ao limite da exaustão.\"},\n    {\"id\": \"2\", \"title\": \"Suporte Especializado\", \"icon\": \"FaUserMd\", \"text\": \"Apoio com fundamentação científica e prática.\"},\n    {\"id\": \"3\", \"title\": \"Sem Franquia\", \"icon\": \"FaHandHoldingUsd\", \"text\": \"Modelo de negócio livre de taxas extras.\"},\n    {\"id\": \"4\", \"title\": \"Visão Integrativa\", \"icon\": \"FaDna\", \"text\": \"União de eletroestimulação com equilíbrio hormonal.\"}\n]'
  ),
  (
    'site_texts',
    '{\n    \"heroTitle\": \"Transforme sua Carreira com o Método Body Harmony\",\n    \"heroSubtitle\": \"A Evolução da Remodelação Corporal.\",\n    \"heroCta\": \"Registre seu interesse\",\n    \"painTitle\": \"Não é apenas um choquinho\",\n    \"painCard1Title\": \"❌ Eletroestimulação Comum\",\n    \"painCard1Content\": \"<ul><li>🚫 Protocolos genéricos.</li></ul>\",\n    \"painCard2Title\": \"✅ Método Body Harmony\",\n    \"painCard2Content\": \"<ul><li>⚡ Raciocínio Clínico Integrativo.</li></ul>\",\n    \"testimonialQuote\": \"Amei conhecer o Body Harmony.\",\n    \"testimonialAuthor\": \"Licenciada\",\n    \"testimonialRole\": \"Profissional de Estética\",\n    \"aboutTitle\": \"O que você vai aprender\",\n    \"aboutDescription\": \"Método validado\",\n    \"contactTitle\": \"Dúvidas?\",\n    \"footerEmail\": \"contato@bodyharmony.com\",\n    \"footerCopyright\": \"Body Harmony - 2025\"\n}'
  ),
  (
    'theme_settings',
    '{\"presetId\":\"original\",\"colors\":{\"primary\":\"#1B4E6B\",\"secondary\":\"#DA8E3A\",\"dark\":\"#081B2B\",\"light\":\"#FAFAFA\",\"white\":\"#FFFFFF\",\"text\":\"#333333\"}}'
  );
-- Students (Sample of 3 key students - all 38 should be imported in full production restore)
INSERT INTO `students` (
    `id`,
    `name`,
    `username`,
    `email`,
    `password_hash`,
    `is_active`
  )
VALUES (
    1,
    'Simône Àssis',
    'simonesantosmassage',
    NULL,
    '$2y$12$UZK8BvBIDATCryekNIjlvOEmUHTyQUt5SU2GVmWs.T8jkJUwjm1VG',
    1
  ),
  (
    2,
    'Kaprice Meirelles',
    'kaprice_meirelles',
    NULL,
    '$2y$12$UZK8BvBIDATCryekNIjlvOEmUHTyQUt5SU2GVmWs.T8jkJUwjm1VG',
    1
  ),
  (
    38,
    'Josi Silva',
    'josisilva_estetica',
    NULL,
    '$2y$10$awBd2SYaIFZLpg6v.xUT5eAdGm5/a0d.KIsL6UrSH/ofCaoZjF5xK',
    1
  );
-- Constraints Check
SET FOREIGN_KEY_CHECKS = 1;
-- Migration V34: Doctor Harmony Rebranding
-- Timestamp: 2026-02-17
-- Description: Updates the AI name in site configuration and standardizes audit logs.
-- FIX: Ensure database selection for manual imports
USE u388974772_bodyharmony_db;
START TRANSACTION;
-- 1. Update Site Config (The Brain Identity)
INSERT INTO site_config (config_key, config_value)
VALUES ('ai_name', 'Doctor Harmony') ON DUPLICATE KEY
UPDATE config_value = 'Doctor Harmony';
INSERT INTO site_config (config_key, config_value)
VALUES (
    'ai_slogan',
    'Sua mentora técnica em fisiologia estética.'
  ) ON DUPLICATE KEY
UPDATE config_value = 'Sua mentora técnica em fisiologia estética.';
-- 2. Update System Prompt Key (If using dynamic config)
-- Renames 'ana_system_prompt' to 'doctor_harmony_system_prompt' if it exists
UPDATE ai_config
SET config_key = 'doctor_harmony_system_prompt'
WHERE config_key = 'ana_system_prompt';
-- 3. Audit Logs (Optional - Keeping history but tagging new era)
-- This query marks the transition point in logs if needed
-- 3. Audit Logs (Optional - Keeping history but tagging new era)
-- This query marks the transition point in logs if needed
INSERT INTO audit_logs (
    action,
    severity,
    user_type,
    description,
    details
  )
VALUES (
    'SYSTEM_MIGRATION',
    'INFO',
    'system',
    'System Identity Transitioned to Doctor Harmony (V23)',
    '{"migration": "V34", "agent": "Antigravity"}'
  );
COMMIT;
-- Migration V35: Add doctor_harmony_response to ai_clinical_cases
-- FIX: Ensure database selection for manual imports
USE u388974772_bodyharmony_db;
DELIMITER $$ DROP PROCEDURE IF EXISTS upgrade_ai_clinical_cases_v35 $$ CREATE PROCEDURE upgrade_ai_clinical_cases_v35() BEGIN -- Add doctor_harmony_response if not exists
IF NOT EXISTS (
  SELECT *
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ai_clinical_cases'
    AND COLUMN_NAME = 'doctor_harmony_response'
) THEN
ALTER TABLE ai_clinical_cases
ADD COLUMN doctor_harmony_response TEXT DEFAULT NULL
AFTER photo_path;
END IF;
-- Add mentor_feedback if not exists
IF NOT EXISTS (
  SELECT *
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ai_clinical_cases'
    AND COLUMN_NAME = 'mentor_feedback'
) THEN
ALTER TABLE ai_clinical_cases
ADD COLUMN mentor_feedback TEXT DEFAULT NULL
AFTER doctor_harmony_response;
END IF;
END $$ DELIMITER;
CALL upgrade_ai_clinical_cases_v35();
DROP PROCEDURE IF EXISTS upgrade_ai_clinical_cases_v35;
-- (V35 Logs Procedure Inlined into Table Definition)
-- 2. Tabela para configurações de proteção (opcional, pode usar site_config)
-- Utilizaremos site_config para chaves de criptografia se necessário, 
-- ou variáveis de ambiente para maior segurança.
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
  policy_type ENUM(
    'terms',
    'privacy',
    'data_processing',
    'ai_usage'
  ) NOT NULL,
  action ENUM('accepted', 'revoked') NOT NULL,
  accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  meta_data JSON NULL COMMENT 'Contexto adicional (device, location)',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE INDEX idx_lgpd_student ON lgpd_consent_logs(student_id);
CREATE INDEX idx_lgpd_action ON lgpd_consent_logs(action);
-- 2. Add LGPD Status Cache to Students Table
-- This avoids querying log history on every request. Stores critical flags like {ai_usage: true}.
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'students'
      AND column_name = 'lgpd_status'
  );
SET @alter_sql = IF(
    @col_exists > 0,
    'SELECT 1',
    'ALTER TABLE students ADD COLUMN lgpd_status JSON DEFAULT NULL'
  );
PREPARE stmt
FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- ==============================================================================
-- BODY HARMONY -- V62: SIGNAL TOWER EVOLUTION (2026-02-26)
-- OBJECTIVE: Add segmentation and read tracking to system broadcasts.
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. Patch system_broadcasts table
ALTER TABLE `system_broadcasts`
ADD COLUMN `target_roles` TEXT DEFAULT NULL COMMENT 'JSON array of roles like ["admin", "licenciada"]',
  ADD COLUMN `target_levels` TEXT DEFAULT NULL COMMENT 'JSON array of levels like ["standard", "platinum"]',
  ADD COLUMN `is_blocking` TINYINT(1) DEFAULT 0 COMMENT 'If 1, user must acknowledge before continuing';
-- 2. Create read logs table
CREATE TABLE IF NOT EXISTS `system_broadcast_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `broadcast_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `user_type` ENUM('admin', 'licenciada') NOT NULL,
  `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_sb_broadcast` (`broadcast_id`),
  KEY `idx_sb_user` (`user_id`, `user_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 3. Audit
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
    'SCHEMA_PATCH',
    'INFO',
    'system',
    'Executed V62_Signal_Tower_Evolution.sql'
  );-- ============================================================
-- V68: Portal Aluna Individual (Cursos Avulsos)
-- Data: 2026-03-02
-- Descrição: Cria entidade 'aluna' completamente isolada da
--            tabela 'licenciadas'. Alunas são clientes esporádicas
--            que compram cursos individuais. Zero contaminação.
-- ============================================================

-- 1. Tabela principal de alunas
CREATE TABLE IF NOT EXISTS alunas (
    id                    INT(11)      NOT NULL AUTO_INCREMENT,
    name                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(100) NOT NULL,
    cpf                   VARCHAR(14)  NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    is_active             TINYINT(1)   DEFAULT 1,
    force_password_change TINYINT(1)   DEFAULT 1,
    failed_login_attempts TINYINT(4)   DEFAULT 0,
    locked_until          DATETIME     NULL,
    last_login_at         DATETIME     NULL,
    max_devices           INT(11)      DEFAULT 1,
    admin_notes           TEXT         NULL,
    lgpd_status           TEXT         NULL,
    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_email (email),
    UNIQUE KEY uq_aluna_cpf   (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Fingerprinting de dispositivos de alunas
CREATE TABLE IF NOT EXISTS aluna_devices (
    id               INT(11)      NOT NULL AUTO_INCREMENT,
    aluna_id         INT(11)      NOT NULL,
    device_token     VARCHAR(64)  NOT NULL,
    user_agent       VARCHAR(255) NULL,
    ip_address       VARCHAR(45)  NULL,
    is_active        TINYINT(1)   DEFAULT 1,
    fingerprint_hash VARCHAR(64)  NULL,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_used_at     TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_device_token (device_token),
    KEY idx_aluna_devices_aluna_id (aluna_id),
    KEY idx_aluna_devices_fingerprint (fingerprint_hash),
    CONSTRAINT fk_aluna_device_aluna
        FOREIGN KEY (aluna_id) REFERENCES alunas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Controle de acesso a módulos LMS por aluna
CREATE TABLE IF NOT EXISTS aluna_course_access (
    id          INT(11)  NOT NULL AUTO_INCREMENT,
    aluna_id    INT(11)  NOT NULL,
    module_id   INT(11)  NOT NULL,
    granted_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by  INT(11)  NULL,
    expires_at  DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_module_access (aluna_id, module_id),
    KEY idx_aluna_access_aluna  (aluna_id),
    KEY idx_aluna_access_module (module_id),
    CONSTRAINT fk_aluna_access_aluna
        FOREIGN KEY (aluna_id)  REFERENCES alunas(id)       ON DELETE CASCADE,
    CONSTRAINT fk_aluna_access_module
        FOREIGN KEY (module_id) REFERENCES lms_modules(id)  ON DELETE CASCADE,
    CONSTRAINT fk_aluna_access_admin
        FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Progresso das alunas por aula
CREATE TABLE IF NOT EXISTS aluna_progress (
    id               INT(11)        NOT NULL AUTO_INCREMENT,
    aluna_id         INT(11)        NOT NULL,
    lesson_id        INT(11)        NOT NULL,
    is_completed     TINYINT(1)     DEFAULT 0,
    progress_percent INT(11)        DEFAULT 0,
    watched_duration INT(11)        DEFAULT 0,
    completion_date  TIMESTAMP      NULL,
    last_watched_at  TIMESTAMP      NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_progress (aluna_id, lesson_id),
    KEY idx_aluna_progress_lesson (lesson_id),
    CONSTRAINT fk_aluna_progress_aluna
        FOREIGN KEY (aluna_id)  REFERENCES alunas(id)       ON DELETE CASCADE,
    CONSTRAINT fk_aluna_progress_lesson
        FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Certificados de conclusão das alunas
CREATE TABLE IF NOT EXISTS aluna_certificates (
    id        INT(11)      NOT NULL AUTO_INCREMENT,
    aluna_id  INT(11)      NOT NULL,
    module_id INT(11)      NOT NULL,
    hash_code VARCHAR(64)  NOT NULL,
    issued_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    pdf_url   VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_aluna_cert (aluna_id, module_id),
    UNIQUE KEY uq_aluna_cert_hash (hash_code),
    KEY idx_aluna_cert_module (module_id),
    CONSTRAINT fk_aluna_cert_aluna
        FOREIGN KEY (aluna_id)  REFERENCES alunas(id)       ON DELETE CASCADE,
    CONSTRAINT fk_aluna_cert_module
        FOREIGN KEY (module_id) REFERENCES lms_modules(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. BOT & SUPPORT SYSTEM (V94.1 Nexus)
-- ============================================================

-- 1. Estado de conversa por chat_id (máquina de estados)
CREATE TABLE IF NOT EXISTS bot_sessions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  chat_id    BIGINT NOT NULL,
  state      VARCHAR(50) NOT NULL DEFAULT 'idle',
  data_json  LONGTEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chat_id (chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tickets de suporte encaminhados ao grupo de staff
CREATE TABLE IF NOT EXISTS bot_support_tickets (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  chat_id           BIGINT NOT NULL,
  user_name         VARCHAR(100) NULL,
  telegram_username VARCHAR(100) NULL,
  message           TEXT NOT NULL,
  group_message_id  INT NULL,
  status            ENUM('open','attending','closed') DEFAULT 'open',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_chat_id (chat_id),
  KEY idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela de Feedback CSAT (1-5 estrelas)
CREATE TABLE IF NOT EXISTS support_feedback (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id   INT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES bot_support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Magic Tokens para Auto-Login Portal
CREATE TABLE IF NOT EXISTS magic_tokens (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    licenciada_id   INT NOT NULL,
    token           VARCHAR(128) NOT NULL,
    used_at         TIMESTAMP NULL DEFAULT NULL,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_token (token),
    FOREIGN KEY (licenciada_id) REFERENCES licenciadas(id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

