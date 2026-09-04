-- infrastructure/database/migrations/V170__crm_automation_kanban_and_media_tables.sql
-- Nexus Protocol V3.1 — CRM Automation Engine, Media Sync & Visual Kanban (PLAN-170)

CREATE TABLE IF NOT EXISTS `crm_patient_photos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `phone_e164` VARCHAR(30) NOT NULL,
    `conversation_id` INT DEFAULT NULL,
    `photo_type` ENUM('ANTES', 'DEPOIS', 'EVOLUCAO', 'DOCUMENTO') DEFAULT 'EVOLUCAO',
    `image_url` VARCHAR(500) NOT NULL,
    `drive_file_id` VARCHAR(255) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_phone_photos` (`phone_e164`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `crm_kanban_cards` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pipeline_type` ENUM('CLINICA', 'COMERCIAL') NOT NULL DEFAULT 'CLINICA',
    `stage` VARCHAR(50) NOT NULL DEFAULT 'novo_contato',
    `conversation_id` INT DEFAULT NULL,
    `contact_phone` VARCHAR(30) NOT NULL,
    `contact_name` VARCHAR(150) NOT NULL,
    `value_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `priority` ENUM('BAIXA', 'MEDIA', 'ALTA', 'VIP') DEFAULT 'MEDIA',
    `assigned_agent` VARCHAR(100) DEFAULT 'Equipe Body Harmony',
    `last_interaction_at` DATETIME DEFAULT NULL,
    `metadata_json` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_pipeline_contact` (`pipeline_type`, `contact_phone`),
    INDEX `idx_pipeline_stage` (`pipeline_type`, `stage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `crm_google_contacts_sync` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `contact_phone` VARCHAR(30) NOT NULL UNIQUE,
    `formatted_name` VARCHAR(200) NOT NULL,
    `contact_category` ENUM('PACIENTE', 'ALUNA', 'LICENCIADA', 'LEAD') DEFAULT 'LEAD',
    `google_resource_name` VARCHAR(255) DEFAULT NULL,
    `synced_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
