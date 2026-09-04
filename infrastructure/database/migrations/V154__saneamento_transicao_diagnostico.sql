-- ==============================================================================
-- MIGRATION V154: SANEAMENTO HISTÓRICO, DIAGNÓSTICO DOCUMENTAL E TOLERÂNCIA DE DADOS
-- ==============================================================================
-- Nexus Protocol V3.1 — PLAN-154
-- 1. Garante colunas defensivas em `licenciada_taxas`
-- 2. Assegura integridade e índices para consultas de regularidade documental
-- ==============================================================================

-- 1. Adicionar colunas defensivas em `licenciada_taxas` se não existirem
SET @dbname = DATABASE();

-- contract_uuid
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'licenciada_taxas'
      AND COLUMN_NAME = 'contract_uuid'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `licenciada_taxas` ADD COLUMN `contract_uuid` VARCHAR(64) NULL AFTER `financial_transaction_id`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- payment_confirmed_at
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'licenciada_taxas'
      AND COLUMN_NAME = 'payment_confirmed_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `licenciada_taxas` ADD COLUMN `payment_confirmed_at` DATETIME NULL AFTER `status`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- contract_signed_at
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'licenciada_taxas'
      AND COLUMN_NAME = 'contract_signed_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `licenciada_taxas` ADD COLUMN `contract_signed_at` DATETIME NULL AFTER `status`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- status_documental
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'licenciada_taxas'
      AND COLUMN_NAME = 'status_documental'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `licenciada_taxas` ADD COLUMN `status_documental` ENUM(\'regularizado\', \'em_analise\', \'aguardando_anexos\') NOT NULL DEFAULT \'aguardando_anexos\' AFTER `status`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Garantir índices para alta performance
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'licenciada_taxas'
      AND INDEX_NAME = 'idx_lt_licenciada_id'
  ) > 0,
  'SELECT 1',
  'CREATE INDEX `idx_lt_licenciada_id` ON `licenciada_taxas` (`licenciada_id`)'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
