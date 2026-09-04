-- ==============================================================================
-- BODY HARMONY -- V48 DEVICE DEDUPLICATION & POLLUTION FIX (2026-02-23)
-- STATUS: READY FOR EXECUTION
-- OBJECTIVE: Resolve multiple device entries for same user/browser
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. Fill missing fingerprint hashes for legacy records
UPDATE licenciada_devices
SET fingerprint_hash = SHA2(user_agent, 256)
WHERE fingerprint_hash IS NULL;
-- 2. Deduplicate: Keep only the most recent entry for each (user, fingerprint)
DELETE d1
FROM licenciada_devices d1
    INNER JOIN licenciada_devices d2
WHERE d1.id < d2.id
    AND d1.licenciada_id = d2.licenciada_id
    AND d1.fingerprint_hash = d2.fingerprint_hash;
-- 3. Add Unique Constraint to prevent future pollution
-- Note: This will naturally fail if duplicates still exist (safety guard)
ALTER TABLE licenciada_devices
ADD UNIQUE INDEX idx_licenciada_fingerprint (licenciada_id, fingerprint_hash);
-- 4. Audit Entry
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'DEVICE_DEDUPLICATION_V48',
        'INFO',
        'system',
        'Cleaned up duplicate device entries and enforced unique (licenciada_id, fingerprint_hash) constraint.'
    );