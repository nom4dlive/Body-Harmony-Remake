-- Protocol V41 Phase 2.1: Missing nomenclature fixes
ALTER TABLE lms_access_logs
    RENAME COLUMN student_id TO licenciada_id;