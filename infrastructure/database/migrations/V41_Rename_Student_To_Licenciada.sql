-- f:\Body-Harmony-Remake\infrastructure\database\migrations\V41_Rename_Student_To_Licenciada.sql
-- Protocol V41: Nomenclature Refresh and Synchronization
-- 1. Rename main table
RENAME TABLE students TO licenciadas;
-- 2. Update Column logic: profile_photo vs photo_url consistency
-- Assuming we stick to profile_photo as standard from V41
-- ALTER TABLE licenciadas CHANGE photo_url profile_photo varchar(255); -- If exists
-- 3. Update Foreign Keys and Columns in related tables
-- student_devices
RENAME TABLE student_devices TO licenciada_devices;
ALTER TABLE licenciada_devices CHANGE student_id licenciada_id int(11);
-- lms_progress
ALTER TABLE lms_progress CHANGE student_id licenciada_id int(11);
-- lgpd_consent_logs
ALTER TABLE lgpd_consent_logs CHANGE student_id licenciada_id int(11);
-- audit_logs
-- (user_type 'student' might be changed to 'licenciada' in code, but schema is fine)
-- 4. Sanitize CPF (11 digits, numeric only)
UPDATE licenciadas
SET cpf = REPLACE(REPLACE(cpf, '.', ''), '-', '')
WHERE cpf IS NOT NULL;
-- 5. Fix order_index vs display_order discrepancy in LMS tables (Standardizing to display_order as per Controller expectations)
ALTER TABLE lms_modules CHANGE order_index display_order int(11) DEFAULT 0;
ALTER TABLE lms_lessons CHANGE order_index display_order int(11) DEFAULT 0;
-- 6. Add missing columns if any (from V40 residue)
-- lms_lessons thumbnail_ref already exists from V45 (which was misnamed in previous cycle)
-- But let's ensure consistency
-- 7. Audit Log
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'MIGRATION_V41',
        'INFO',
        'system',
        'Protocol V41: Renamed students to licenciadas and fixed LMS columns.'
    );