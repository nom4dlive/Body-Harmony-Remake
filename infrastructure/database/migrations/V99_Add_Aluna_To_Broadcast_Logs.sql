-- ==============================================================================
-- BODY HARMONY -- V99: ADD ALUNA TO BROADCAST LOGS ENUM (2026-06-12)
-- OBJECTIVE: Support 'aluna' role in system_broadcast_logs.user_type
-- ==============================================================================
USE u388974772_bodyharmony_db;

ALTER TABLE `system_broadcast_logs`
MODIFY COLUMN `user_type` ENUM('admin', 'licenciada', 'aluna') NOT NULL;

-- Audit Log
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
    'SCHEMA_PATCH',
    'INFO',
    'system',
    'Executed V99_Add_Aluna_To_Broadcast_Logs.sql'
);
