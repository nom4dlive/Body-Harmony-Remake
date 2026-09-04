-- openSpec V2: Naming Synchronization (Protocol V41 Phase 2)
-- Objetivo: Sincronizar colunas de identificação em todas as tabelas satélite.
-- 1. ai_clinical_cases
ALTER TABLE ai_clinical_cases
    RENAME COLUMN student_id TO licenciada_id;
-- 2. lms_licenciada_licenses
ALTER TABLE lms_licenciada_licenses
    RENAME COLUMN licenciada_id TO licenciada_id;
-- 3. lms_certificates
ALTER TABLE lms_certificates
    RENAME COLUMN student_id TO licenciada_id;
-- 4. lms_resource_access
-- (Wait, db_schema_output says it has student_id at line 127)
ALTER TABLE lms_resource_access
    RENAME COLUMN student_id TO licenciada_id;
-- 5. ai_mentorship_logs
ALTER TABLE ai_mentorship_logs
    RENAME COLUMN student_id TO licenciada_id;
-- 6. Verificação de Restrições (Foreign Keys)
-- As restrições devem ser atualizadas automaticamente em alguns sistemas, mas vamos garantir 
-- que os nomes das colunas estão padronizados para evitar erros de JOIN nos controllers PHP.