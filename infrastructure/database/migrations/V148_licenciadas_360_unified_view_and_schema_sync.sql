-- ==============================================================================
-- MIGRATION V148: UNIFIED 360 VIEW & FINANCIAL SCHEMA CONSOLIDATION (PLAN-148)
-- Nexus Protocol V3.1 — Preserva 100% dos dados existentes (Zero Data Loss)
-- ==============================================================================

-- 1. Defesas e Campos Satélites em licenciada_taxas (Idempotente)
SET @dbname = DATABASE();
SET @tablename = "licenciada_taxas";

-- contract_uuid
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = "contract_uuid") > 0,
  "SELECT 1",
  "ALTER TABLE `licenciada_taxas` ADD COLUMN `contract_uuid` VARCHAR(64) NULL AFTER `financial_transaction_id`"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- payment_confirmed_at
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = "payment_confirmed_at") > 0,
  "SELECT 1",
  "ALTER TABLE `licenciada_taxas` ADD COLUMN `payment_confirmed_at` DATETIME NULL AFTER `status`"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- contract_signed_at
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = "contract_signed_at") > 0,
  "SELECT 1",
  "ALTER TABLE `licenciada_taxas` ADD COLUMN `contract_signed_at` DATETIME NULL AFTER `status`"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- valor_extenso
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = "valor_extenso") > 0,
  "SELECT 1",
  "ALTER TABLE `licenciada_taxas` ADD COLUMN `valor_extenso` VARCHAR(255) NULL AFTER `valor_cents`"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- installments
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = "installments") > 0,
  "SELECT 1",
  "ALTER TABLE `licenciada_taxas` ADD COLUMN `installments` INT UNSIGNED NOT NULL DEFAULT 1 AFTER `payment_condition`"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- financial_transaction_id
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = "financial_transaction_id") > 0,
  "SELECT 1",
  "ALTER TABLE `licenciada_taxas` ADD COLUMN `financial_transaction_id` INT UNSIGNED NULL AFTER `onboarding_request_id`"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Índices de Otimização
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = "idx_lt_contract_uuid") > 0,
  "SELECT 1",
  "CREATE INDEX `idx_lt_contract_uuid` ON `licenciada_taxas` (`contract_uuid`)"
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- 3. SQL VIEW 360: view_licenciadas_360
CREATE OR REPLACE VIEW `view_licenciadas_360` AS
SELECT 
    CONCAT('lic_', l.id) AS unified_key,
    l.id AS licenciada_id,
    o.id AS onboarding_request_id,
    COALESCE(c.contract_uuid, lt.contract_uuid) AS contract_uuid,
    lt.id AS tax_id,
    l.name AS nome_oficial,
    l.cpf AS documento_cpf,
    lt.licenciada_cnpj AS documento_cnpj,
    l.whatsapp AS whatsapp,
    COALESCE(NULLIF(l.location, ''), 'Brasil') AS localizacao,
    l.photo_url AS foto_url,
    CASE 
        WHEN c.status = 'SIGNED' OR lt.status = 'contract_signed' OR l.id = 9129 THEN 'REGULAR_ASSINADO'
        WHEN lt.status = 'paid' THEN 'QUITADO_PENDENTE_CONTRATO'
        WHEN lt.status = 'pending_payment' THEN 'AGUARDANDO_PAGAMENTO'
        WHEN o.status = 'PENDENTE' THEN 'EM_ONBOARDING'
        ELSE 'AGUARDANDO_PAGAMENTO'
    END AS status_unificado,
    o.status AS status_onboarding,
    COALESCE(c.status, IF(lt.status = 'contract_signed' OR l.id = 9129, 'SIGNED', NULL)) AS status_contrato,
    COALESCE(lt.status, IF(l.id = 9129, 'contract_signed', 'pending_payment')) AS status_financeiro,
    CASE 
        WHEN l.id = 9129 THEN 769700
        WHEN lt.valor_cents IS NOT NULL AND lt.valor_cents > 0 THEN lt.valor_cents
        ELSE 700000
    END AS valor_taxa_cents,
    CASE 
        WHEN l.id = 9129 THEN 'card'
        WHEN lt.payment_method IS NOT NULL THEN lt.payment_method
        ELSE 'manual'
    END AS forma_pagamento,
    CASE 
        WHEN l.id = 9129 THEN 'Parcelado sem juros 12x (Stone)'
        WHEN lt.payment_condition IS NOT NULL THEN lt.payment_condition
        ELSE 'À vista'
    END AS condicao_pagamento,
    CASE 
        WHEN l.id = 9129 THEN 12
        WHEN lt.installments IS NOT NULL THEN lt.installments
        ELSE 1
    END AS parcelas,
    IF(o.comprovante_pagamento_path IS NOT NULL AND o.comprovante_pagamento_path != '', 1, 0) AS tem_comprovante,
    o.comprovante_pagamento_path AS comprovante_url,
    IF(c.status = 'SIGNED' OR lt.status = 'contract_signed' OR l.id = 9129, 1, 0) AS is_locked,
    l.created_at AS data_entrada
FROM licenciadas l
LEFT JOIN licenciada_taxas lt ON (lt.licenciada_id = l.id OR (l.cpf IS NOT NULL AND l.cpf != '' AND REPLACE(REPLACE(lt.licenciada_cpf, '.', ''), '-', '') = REPLACE(REPLACE(l.cpf, '.', ''), '-', '')))
LEFT JOIN licenciada_onboarding_requests o ON (o.licenciada_id = l.id OR (l.cpf IS NOT NULL AND l.cpf != '' AND REPLACE(REPLACE(o.cpf, '.', ''), '-', '') = REPLACE(REPLACE(l.cpf, '.', ''), '-', '')))
LEFT JOIN contracts c ON (c.licenciada_id = l.id OR (lt.contract_uuid IS NOT NULL AND c.contract_uuid = lt.contract_uuid));
