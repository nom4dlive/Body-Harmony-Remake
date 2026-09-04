-- Migration V35: PDF Protection & Forensics
-- Data: 2026-02-17
-- Autor: Doctor Harmony

-- FIX: Ensure database selection for manual imports
USE u388974772_bodyharmony_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS upgrade_ai_mentorship_logs_v35 $$

CREATE PROCEDURE upgrade_ai_mentorship_logs_v35()
BEGIN
    -- Add resource_id
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ai_mentorship_logs' AND COLUMN_NAME = 'resource_id') THEN
        ALTER TABLE ai_mentorship_logs ADD COLUMN resource_id INT NULL COMMENT 'ID do recurso baixado (se aplicável)';
        CREATE INDEX idx_audit_resource ON ai_mentorship_logs (resource_id);
    END IF;

    -- Add file_hash
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ai_mentorship_logs' AND COLUMN_NAME = 'file_hash') THEN
        ALTER TABLE ai_mentorship_logs ADD COLUMN file_hash VARCHAR(64) NULL COMMENT 'SHA-256 do arquivo gerado';
        CREATE INDEX idx_audit_hash ON ai_mentorship_logs (file_hash);
    END IF;

    -- Add ip_address
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ai_mentorship_logs' AND COLUMN_NAME = 'ip_address') THEN
        ALTER TABLE ai_mentorship_logs ADD COLUMN ip_address VARCHAR(45) NULL COMMENT 'IP do solicitante';
    END IF;

    -- Add geolocation
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ai_mentorship_logs' AND COLUMN_NAME = 'geolocation') THEN
        ALTER TABLE ai_mentorship_logs ADD COLUMN geolocation VARCHAR(100) NULL COMMENT 'Localização aproximada (Cidade, País)';
    END IF;
END $$

DELIMITER ;

CALL upgrade_ai_mentorship_logs_v35();
DROP PROCEDURE IF EXISTS upgrade_ai_mentorship_logs_v35;

-- 2. Tabela para configurações de proteção (opcional, pode usar site_config)
-- Utilizaremos site_config para chaves de criptografia se necessário, 
-- ou variáveis de ambiente para maior segurança.
