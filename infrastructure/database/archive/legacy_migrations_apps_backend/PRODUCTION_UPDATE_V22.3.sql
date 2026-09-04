-- # Body Harmony Consolidation SQL - Version 22.3.0
-- Este arquivo contém todas as atualizações de banco de dados do ciclo mais recente (V22.2 a V22.3)
-- Pode ser importado diretamente no MySQL da Hostinger.

-- === 1. NEXUS OBSERVABILITY V2 (Audit Logs) ===
-- Garante que a tabela audit_logs tenha as colunas necessárias para o novo NexusLogger

SET @dbname = DATABASE();
SET @tablename = "audit_logs";

-- Coluna details (JSON)
SET @columnname = "details";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE audit_logs ADD COLUMN details JSON AFTER description"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Coluna severity
SET @columnname = "severity";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE audit_logs ADD COLUMN severity VARCHAR(20) DEFAULT 'INFO' AFTER action"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices de Performance
ALTER TABLE audit_logs ADD INDEX IF NOT EXISTS idx_severity (severity);
ALTER TABLE audit_logs ADD INDEX IF NOT EXISTS idx_user (user_id, user_type);

-- === 2. LMS & GESTOR STATUS ===
-- Log inicial de sincronização de sistema
INSERT INTO audit_logs (user_id, user_type, action, severity, description, details, created_at)
VALUES (1, 'admin', 'SYSTEM_UPDATE_STABLE', 'INFO', 'Update to V22.3.0 - LMS Reordering Enabled', '{"version": "22.3.0", "features": ["DND_REORDER", "DASHBOARD_HUB"]}', NOW());
