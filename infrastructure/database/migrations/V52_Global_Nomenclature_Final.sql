-- infrastructure/database/migrations/V52_Global_Nomenclature_Final.sql
-- Protocol V52: Final Nomenclature Synchronization (student/aluna -> licenciada)
-- 1. Table: audit_logs (Standardize user_type)
ALTER TABLE audit_logs
MODIFY COLUMN user_type VARCHAR(20) DEFAULT 'licenciada';
UPDATE audit_logs
SET user_type = 'licenciada'
WHERE user_type IN ('student', 'aluna');
-- 2. Table: auth_logs (Standardize user_type)
-- Check if column exists or needs standardizing
-- Note: auth_logs usually has user_id, ensuring naming is consistent with profile type
UPDATE auth_logs
SET status = 'success_licenciada'
WHERE status = 'success_student';
-- 3. Table: ai_mentorship_logs
ALTER TABLE ai_mentorship_logs CHANGE COLUMN student_id licenciada_id INT(11);
-- 4. Table: ai_mentorship_sessions
ALTER TABLE ai_mentorship_sessions CHANGE COLUMN student_id licenciada_id INT(11);
-- 5. Table: lms_access_logs (Final fix for ENUM just in case V51 missed any detail)
ALTER TABLE lms_access_logs
MODIFY COLUMN user_type ENUM('licenciada', 'admin', 'system') NOT NULL;
-- 6. Table: testimonials (Standardize nomenclature in descriptions if applicable)
-- No structural change needed, but documenting current state for future reference.
-- 7. Audit entry
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'NEXUS_NOMENCLATURE_SYNC_V52',
        'INFO',
        'system',
        'Final synchronization of nomenclature completed for all residual tables.'
    );