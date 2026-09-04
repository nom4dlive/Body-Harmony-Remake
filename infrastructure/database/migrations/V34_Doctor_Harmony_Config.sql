-- Migration V34: Doctor Harmony Rebranding
-- Timestamp: 2026-02-17
-- Description: Updates the AI name in site configuration and standardizes audit logs.

-- FIX: Ensure database selection for manual imports
USE u388974772_bodyharmony_db;

START TRANSACTION;

-- 1. Update Site Config (The Brain Identity)
INSERT INTO site_config (config_key, config_value)
VALUES ('ai_name', 'Doctor Harmony')
ON DUPLICATE KEY UPDATE config_value = 'Doctor Harmony';

INSERT INTO site_config (config_key, config_value)
VALUES ('ai_slogan', 'Sua mentora técnica em fisiologia estética.')
ON DUPLICATE KEY UPDATE config_value = 'Sua mentora técnica em fisiologia estética.';

-- 2. Update System Prompt Key (If using dynamic config)
-- Renames 'ana_system_prompt' to 'doctor_harmony_system_prompt' if it exists
UPDATE ai_config 
SET config_key = 'doctor_harmony_system_prompt' 
WHERE config_key = 'ana_system_prompt';

-- 3. Audit Logs (Optional - Keeping history but tagging new era)
-- This query marks the transition point in logs if needed
-- 3. Audit Logs (Optional - Keeping history but tagging new era)
-- This query marks the transition point in logs if needed
INSERT INTO audit_logs (action, severity, user_type, description, details)
VALUES ('SYSTEM_MIGRATION', 'INFO', 'system', 'System Identity Transitioned to Doctor Harmony (V23)', '{"migration": "V34", "agent": "Antigravity"}');

COMMIT;
