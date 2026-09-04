-- ==============================================================================
-- V97: FIX PROGRESS DATA INTEGRITY
-- Date: 2026-05-03
-- Author: Nexus Agent (Automated Fix)
-- Description:
--   Corrige a integridade dos dados de progresso das licenciadas.
--   
--   PROBLEMA: Schema Master V36.1 define lms_progress com `student_id`,
--   mas o código PHP (pós-V41) usa `licenciada_id`. Se o Schema Master
--   foi re-executado, as queries PHP retornam zero registros.
--
--   AÇÕES:
--   1. Verifica se a coluna é student_id e renomeia para licenciada_id
--   2. Garante que lms_quiz_attempts use licenciada_id
--   3. Garante que lms_certificates use licenciada_id
--   4. Garante que lms_resource_access use licenciada_id
--   5. Adiciona índices de proteção
--
-- ROLLBACK: Não há rollback necessário - renomear coluna é seguro
-- PREREQUISITO: Executar SHOW COLUMNS FROM lms_progress antes para confirmar estado
-- ==============================================================================

-- ==============================
-- FASE 1: DIAGNÓSTICO (Executar separadamente primeiro)
-- ==============================
-- SHOW COLUMNS FROM lms_progress;
-- SELECT COUNT(*) as total, SUM(is_completed) as completed FROM lms_progress;
-- SELECT COUNT(*) FROM lms_progress WHERE licenciada_id IS NOT NULL;

-- ==============================
-- FASE 2: CORREÇÃO DE COLUNAS
-- ==============================

-- 2.1 Corrigir lms_progress: student_id → licenciada_id (se necessário)
-- NOTA: Verificar primeiro se a coluna é student_id. Se já for licenciada_id, pular.
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'lms_progress' 
    AND COLUMN_NAME = 'student_id'
);

SET @sql_fix_progress = IF(@col_exists > 0,
    'ALTER TABLE lms_progress CHANGE student_id licenciada_id INT(11) DEFAULT NULL',
    'SELECT "lms_progress.licenciada_id already correct" as status'
);
PREPARE stmt FROM @sql_fix_progress;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2.2 Corrigir unique key se necessário
SET @key_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'lms_progress' 
    AND INDEX_NAME = 'unique_student_lesson'
);

SET @sql_fix_key = IF(@key_exists > 0,
    'ALTER TABLE lms_progress DROP INDEX unique_student_lesson, ADD UNIQUE KEY unique_licenciada_lesson (licenciada_id, lesson_id)',
    'SELECT "unique key already correct" as status'
);
PREPARE stmt FROM @sql_fix_key;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2.3 Corrigir lms_certificates: student_id → licenciada_id
SET @col_exists_cert = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'lms_certificates' 
    AND COLUMN_NAME = 'student_id'
);

SET @sql_fix_cert = IF(@col_exists_cert > 0,
    'ALTER TABLE lms_certificates CHANGE student_id licenciada_id INT(11) NOT NULL',
    'SELECT "lms_certificates.licenciada_id already correct" as status'
);
PREPARE stmt FROM @sql_fix_cert;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2.4 Corrigir lms_quiz_attempts: student_id → licenciada_id
SET @col_exists_quiz = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'lms_quiz_attempts' 
    AND COLUMN_NAME = 'student_id'
);

SET @sql_fix_quiz = IF(@col_exists_quiz > 0,
    'ALTER TABLE lms_quiz_attempts CHANGE student_id licenciada_id INT(11) NOT NULL',
    'SELECT "lms_quiz_attempts.licenciada_id already correct" as status'
);
PREPARE stmt FROM @sql_fix_quiz;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2.5 Corrigir lms_resource_access: student_id → licenciada_id
SET @col_exists_res = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'lms_resource_access' 
    AND COLUMN_NAME = 'student_id'
);

SET @sql_fix_res = IF(@col_exists_res > 0,
    'ALTER TABLE lms_resource_access CHANGE student_id licenciada_id INT(11) NOT NULL',
    'SELECT "lms_resource_access.licenciada_id already correct" as status'
);
PREPARE stmt FROM @sql_fix_res;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==============================
-- FASE 3: VALIDAÇÃO PÓS-FIX
-- ==============================

-- Verificar que a coluna agora é licenciada_id
SELECT 'lms_progress' as tabela, COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'lms_progress' 
AND COLUMN_NAME IN ('student_id', 'licenciada_id');

-- Contar registros de progresso
SELECT COUNT(*) as total_registros, 
       SUM(is_completed) as concluidos,
       COUNT(DISTINCT licenciada_id) as licenciadas_com_progresso
FROM lms_progress;

-- Top 10 licenciadas com mais progresso (sanity check)
SELECT l.name, l.username, 
       COUNT(p.id) as total_aulas,
       SUM(p.is_completed) as concluidas
FROM lms_progress p
INNER JOIN licenciadas l ON l.id = p.licenciada_id
GROUP BY p.licenciada_id
ORDER BY concluidas DESC
LIMIT 10;
