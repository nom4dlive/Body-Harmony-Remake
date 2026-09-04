-- Migration V66: Add User Agent to LMS Access Logs
-- Descrição: Adiciona coluna user_agent para identificação de dispositivo (Nexus Protocol V3.1)
-- Autor: Antigravity AI (Principal Full-Stack Engineer)

ALTER TABLE lms_access_logs 
ADD COLUMN user_agent TEXT NULL AFTER ip_address;

-- Atualiza log de auditoria
INSERT INTO audit_logs (action, severity, user_type, description) 
VALUES ('SCHEMA_PATCH', 'INFO', 'system', 'Executed V66_Add_UserAgent_LmsLogs.sql');
