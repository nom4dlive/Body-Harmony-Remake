-- infrastructure/database/migrations/V53_Fix_Library_Upload_Schema.sql
-- Protocol V53: Fix Library Upload Schema and Residual Nomenclature Sync
-- 1. Table: lms_resources (Fixing missing columns for LibraryController)
ALTER TABLE lms_resources
ADD COLUMN file_name VARCHAR(255) DEFAULT NULL
AFTER title,
    ADD COLUMN size_bytes BIGINT(20) DEFAULT 0
AFTER file_type,
    ADD COLUMN category VARCHAR(50) DEFAULT 'unassigned'
AFTER size_bytes,
    ADD COLUMN created_by INT(11) DEFAULT NULL
AFTER category;
-- 2. Table: lms_resource_access (Sync Nomenclature)
ALTER TABLE lms_resource_access CHANGE COLUMN student_id licenciada_id INT(11);
-- 3. Table: lms_access_logs (Final Cleanup of legacy ENUM references)
-- Note: Already has licenciada_id, ensuring user_type is strictly synchronized
ALTER TABLE lms_access_logs
MODIFY COLUMN user_type ENUM('licenciada', 'admin', 'system') NOT NULL;
-- 4. Audit entry
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'NEXUS_UPLOAD_FIX_V53',
        'INFO',
        'system',
        'Restored lms_resources structural integrity and synchronized resource access nomenclature.'
    );