-- infrastructure/database/migrations/V166__crm_super_cockpit_tables.sql
-- Nexus Protocol V3.1 — CRM Super-Cockpit & Appointments (PLAN-166)

CREATE TABLE IF NOT EXISTS `crm_appointments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `inbox_id` INT DEFAULT 1,
    `conversation_id` INT DEFAULT NULL,
    `contact_phone` VARCHAR(30) NOT NULL,
    `patient_name` VARCHAR(150) NOT NULL,
    `procedure_name` VARCHAR(150) NOT NULL,
    `scheduled_at` DATETIME NOT NULL,
    `duration_minutes` INT DEFAULT 60,
    `status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    `google_event_id` VARCHAR(255) DEFAULT NULL,
    `reminder_sent_24h` TINYINT(1) DEFAULT 0,
    `reminder_sent_2h` TINYINT(1) DEFAULT 0,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_scheduled_at` (`scheduled_at`),
    INDEX `idx_contact_phone` (`contact_phone`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `crm_patient_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `phone_e164` VARCHAR(30) NOT NULL UNIQUE,
    `cpf` VARCHAR(20) DEFAULT NULL,
    `name` VARCHAR(150) NOT NULL,
    `drive_folder_url` VARCHAR(255) DEFAULT NULL,
    `last_anamnese_at` DATETIME DEFAULT NULL,
    `total_sessions_count` INT DEFAULT 0,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_phone` (`phone_e164`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
