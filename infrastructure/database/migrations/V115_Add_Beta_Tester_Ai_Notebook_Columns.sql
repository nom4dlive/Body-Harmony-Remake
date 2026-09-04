-- V115: Adiciona colunas para liberação manual de Beta Testers e limite de créditos no IA Notebook
-- Nexus Protocol V3.1 — PLAN-101

SET NAMES utf8mb4;

-- Adiciona colunas na tabela licenciadas se não existirem
SET @dbname = DATABASE();
SET @tablename = "licenciadas";
SET @columnname = "ai_notebook_beta_enabled";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE licenciadas ADD COLUMN ai_notebook_beta_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER status;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname2 = "ai_notebook_credits_limit";
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname2
  ) > 0,
  "SELECT 1",
  "ALTER TABLE licenciadas ADD COLUMN ai_notebook_credits_limit INT NOT NULL DEFAULT 100 AFTER ai_notebook_beta_enabled;"
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;
