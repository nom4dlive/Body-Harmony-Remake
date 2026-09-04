-- ============================================================================
-- V125_Financial_Audit_And_Security.sql
-- PLAN-138: Blindagem LGPD do Cockpit Financeiro
-- Autor: @antigravity | Data: 2026-08-26
-- ============================================================================

-- 1. Tabela de audit trail para operações financeiras sensíveis
CREATE TABLE IF NOT EXISTS `financial_audit_log` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT UNSIGNED NOT NULL,
  `admin_username` VARCHAR(100) NOT NULL,
  `action` ENUM('export_csv','sync_all','seed_historical','receipt_sent','attachment_upload','attachment_delete') NOT NULL,
  `filters_json` JSON NULL COMMENT 'Filtros aplicados no momento da ação',
  `records_affected` INT UNSIGNED NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fal_admin` (`admin_id`),
  INDEX `idx_fal_action` (`action`),
  INDEX `idx_fal_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Colunas de tracking de download em financial_attachments
ALTER TABLE `financial_attachments`
  ADD COLUMN IF NOT EXISTS `download_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `mime_type`,
  ADD COLUMN IF NOT EXISTS `last_downloaded_at` DATETIME NULL AFTER `download_count`,
  ADD COLUMN IF NOT EXISTS `last_downloaded_by` INT UNSIGNED NULL AFTER `last_downloaded_at`;
