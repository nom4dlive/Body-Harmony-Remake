-- ==============================================================================
-- Body Harmony Nexus V3.1 - Database Migration V188
-- Description: Suporte a Google People API, Google Drive Prontuários e Telemetria
-- Target Engine: MySQL 8.0+ / MariaDB 10.6+
-- ==============================================================================

-- 1. Atualizar crm_google_contacts_sync
ALTER TABLE `crm_google_contacts_sync`
    ADD COLUMN IF NOT EXISTS `etag` VARCHAR(255) DEFAULT NULL AFTER `google_resource_name`,
    ADD COLUMN IF NOT EXISTS `sync_status` ENUM("PENDING", "SYNCED", "FAILED") DEFAULT "PENDING" AFTER `etag`,
    ADD COLUMN IF NOT EXISTS `sync_error` TEXT DEFAULT NULL AFTER `sync_status`;

-- 2. Tabela de Mapeamento de Pastas de Prontuários no Google Drive
CREATE TABLE IF NOT EXISTS `crm_drive_folders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_phone` VARCHAR(30) NOT NULL,
    `patient_name` VARCHAR(200) NOT NULL,
    `google_folder_id` VARCHAR(255) NOT NULL,
    `folder_url` VARCHAR(500) DEFAULT NULL,
    `files_count` INT DEFAULT 0,
    `last_synced_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_patient_phone` (`patient_phone`),
    INDEX `idx_folder_id` (`google_folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Telemetria e Histórico de Sonda de Microsserviços
CREATE TABLE IF NOT EXISTS `crm_service_health_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_name` VARCHAR(50) NOT NULL,
    `status` ENUM("HEALTHY", "DEGRADED", "OFFLINE") NOT NULL,
    `latency_ms` INT NOT NULL DEFAULT 0,
    `details_json` JSON DEFAULT NULL,
    `checked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_service_checked` (`service_name`, `checked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
