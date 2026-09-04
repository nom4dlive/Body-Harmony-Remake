-- ==============================================================================
-- BODY HARMONY -- V75 ADD TESTER FLAG & DEVICE MANAGEMENT
-- STATUS: NEXUS MITIGATION
-- OBJECTIVE: Silence alerts for test accounts and allow remote device revocation
-- ==============================================================================

-- 1. Add is_tester flag to licenciadas
ALTER TABLE `licenciadas` 
ADD COLUMN `is_tester` TINYINT(1) DEFAULT 0 AFTER `is_active`;

-- 2. Ensure index for fast revocation
-- (The table licenciada_devices usually has index on licenciada_id)
-- CREATE INDEX IF NOT EXISTS idx_licenciada_devices_id ON licenciada_devices(licenciada_id);

-- 3. Audit Log
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
    'SCHEMA_UPGRADE_V75',
    'INFO',
    'system',
    'Added is_tester column and prepared for device management evolution'
);
