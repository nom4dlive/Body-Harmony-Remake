-- infrastructure/database/migrations/V54_Fix_Resource_Access_Audit.sql
-- Protocol V54: Fix Resource Access Audit and Foreign Keys
-- 1. Table: lms_resource_access (Adding missing audit column)
ALTER TABLE lms_resource_access
ADD COLUMN granted_by INT(11) DEFAULT NULL
AFTER granted_at;
-- 2. Audit entry
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'NEXUS_ACCESS_FIX_V54',
        'INFO',
        'system',
        'Added missing granted_by column to lms_resource_access for audit purposes.'
    );