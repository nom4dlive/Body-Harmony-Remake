-- V123: Tabela de Taxas de Licenciamento - Portal do Gestor
-- Nexus Protocol V3.1 -- PLAN-132 / PLAN-137: Integracao Relatorio Juridico no Painel Financeiro
-- Data: 2026-08-25

CREATE TABLE IF NOT EXISTS `licenciada_taxas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `licenciada_id` INT(11) NULL,
  `licenciada_name` VARCHAR(255) NOT NULL,
  `licenciada_cpf` VARCHAR(20) NULL,
  `licenciada_cnpj` VARCHAR(30) NULL,
  `licenciada_location` VARCHAR(200) NULL,
  `valor_cents` INT UNSIGNED NOT NULL,
  `valor_extenso` VARCHAR(255) NULL,
  `payment_method` ENUM('pix','card','transfer','manual') NOT NULL DEFAULT 'manual',
  `payment_condition` VARCHAR(255) NULL,
  `installments` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('pending_payment','paid','contract_signed','cancelled') NOT NULL DEFAULT 'pending_payment',
  `contract_signed_at` DATETIME NULL,
  `payment_confirmed_at` DATETIME NULL,
  `notes` TEXT NULL,
  `attachments_json` TEXT NULL,
  `source` ENUM('onboarding','manual','imported') NOT NULL DEFAULT 'manual',
  `onboarding_request_id` BIGINT UNSIGNED NULL,
  `financial_transaction_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_lt_licenciada` (`licenciada_id`),
  INDEX `idx_lt_onboarding` (`onboarding_request_id`),
  INDEX `idx_lt_status` (`status`),
  INDEX `idx_lt_cpf` (`licenciada_cpf`),
  INDEX `idx_lt_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
