-- ==============================================================================
-- Body Harmony Nexus V3.1 - Database Migration V190
-- Description: Background Workers, Anti No-Show Automation & Execution Logs
-- Target Engine: MySQL 8.0+ / MariaDB 10.6+
-- ==============================================================================

-- 1. Tabela de Logs de Execução dos Background Workers
CREATE TABLE IF NOT EXISTS `crm_worker_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `worker_name` VARCHAR(50) NOT NULL,
    `items_processed` INT DEFAULT 0,
    `errors_count` INT DEFAULT 0,
    `execution_time_ms` INT DEFAULT 0,
    `status` ENUM('SUCCESS', 'WARNING', 'ERROR') DEFAULT 'SUCCESS',
    `details_json` JSON DEFAULT NULL,
    `executed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_worker_executed` (`worker_name`, `executed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Garantir índices de performance para consultas e lembretes
ALTER TABLE `gestor_agenda_events` 
    ADD INDEX IF NOT EXISTS `idx_agenda_worker_search` (`start_datetime`, `status`);
