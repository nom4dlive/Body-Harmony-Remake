-- ==============================================================================
-- BODY HARMONY -- V43: FIX NULL PASSWORDS
-- STATUS: CRITICAL - Fix Null Passwords for recently added licenciadas
-- OBJECTIVE: Rescue accounts created without a password, forcing them to 'Mudar123!'
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. UPDATE PASSWORDS FOR ORPHANED ACCOUNTS
-- Hash for 'Mudar123!': $2y$12$luoClyG.xSRedqjR//w94O/W7ei50nf371shSMVUcYZVlryUyvYWC
UPDATE `licenciadas`
SET `password_hash` = '$2y$12$luoClyG.xSRedqjR//w94O/W7ei50nf371shSMVUcYZVlryUyvYWC',
    `force_password_change` = 1
WHERE `password_hash` IS NULL
    AND `is_active` = 1;
-- 2. AUDIT
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'MIGRATION_V43_AUTH',
        'INFO',
        'system',
        'Rescued active licenciadas with NULL passwords, setting default to Mudar123! and forcing password change'
    );