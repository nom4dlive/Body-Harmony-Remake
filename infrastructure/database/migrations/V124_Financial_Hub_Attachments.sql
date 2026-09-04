-- V124: Tabela de Anexos Financeiros e Campos de Suporte
-- Nexus Protocol V3.1 -- PLAN-133: Hub Financeiro Unificado & Gestao Operacional da Josi
-- Data: 2026-08-25

CREATE TABLE IF NOT EXISTS `financial_attachments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `parent_type` ENUM('license_tax','transaction') NOT NULL,
  `parent_id` INT UNSIGNED NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
  `uploaded_by_admin_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fa_parent` (`parent_type`, `parent_id`),
  INDEX `idx_fa_uploaded_by` (`uploaded_by_admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adiciona coluna de anexos na tabela licenciada_taxas se nao existir
SET @dbname = DATABASE();
SET @tablename = 'licenciada_taxas';
SET @columnname = 'attachments_json';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `licenciada_taxas` ADD COLUMN `attachments_json` TEXT NULL AFTER `notes`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
