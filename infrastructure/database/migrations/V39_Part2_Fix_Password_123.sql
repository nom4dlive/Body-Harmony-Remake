-- ==============================================================================
-- BODY HARMONY -- V39 PART 2: PASSWORD CORRECTION
-- STATUS: CRITICAL - Fix Default Password
-- OBJECTIVE: Reset passwords to 'Mudar123!' (User Request)
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. UPDATE PASSWORDS
-- Hash for 'Mudar123!': $2y$12$luoClyG.xSRedqjR//w94O/W7ei50nf371shSMVUcYZVlryUyvYWC
UPDATE `students`
SET `password_hash` = '$2y$12$luoClyG.xSRedqjR//w94O/W7ei50nf371shSMVUcYZVlryUyvYWC',
    `force_password_change` = 1
WHERE `is_active` = 1;
-- 2. AUDIT
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'AUTH_RESET_V39_2',
        'INFO',
        'system',
        'Updated default password to Mudar123!'
    );