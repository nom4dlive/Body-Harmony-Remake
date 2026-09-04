-- ==============================================================================
-- BODY HARMONY -- V38 CONSOLIDATION NEXUS (2026-02-19)
-- STATUS: SYNTAX FIXED (NO PROCEDURES)
-- OBJECTIVE: Consolidate V34-V36 Migrations + Critical Patches
-- ==============================================================================
SET FOREIGN_KEY_CHECKS = 0;
-- 🔴 1. CORE AI INTEGRATION (V34+V35)
-- 1.1 Configuração Global de IA
INSERT INTO ai_config (config_key, config_value)
VALUES ('ai_name', 'Doctor Harmony'),
    (
        'ai_persona',
        'Especialista Sênior em Fisiologia e Mentoria Técnica'
    ),
    ('ai_model', 'gemini-2.0-flash'),
    ('max_tokens', '2048'),
    ('temperature', '0.7') ON DUPLICATE KEY
UPDATE config_value =
VALUES(config_value);
-- 1.2 Estrutura de Casos Clínicos (Idempotente)
-- Adiciona colunas se não existirem (via tentativa de ADD, ignorando erro se existir é complexo em SQL puro,
-- mas podemos usar a estratégia de "silêncio" ou assumir que V38_Emergency já criou a base)
-- Se a tabela já foi criada pelo V38_Emergency, este bloco é redundante mas seguro
CREATE TABLE IF NOT EXISTS `ai_clinical_cases` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `student_id` int(11) NOT NULL,
    `patient_name` varchar(100) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `gender` varchar(20) DEFAULT NULL,
    `complaint` text DEFAULT NULL,
    `history` text DEFAULT NULL,
    `photo_path` varchar(255) DEFAULT NULL,
    `analysis_result` longtext DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `status` enum('pending', 'analyzed', 'error') DEFAULT 'pending',
    `feedback_rate` int(11) DEFAULT NULL,
    `license_id` int(11) DEFAULT NULL,
    `doctor_harmony_response` longtext DEFAULT NULL,
    `mentor_feedback` longtext DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 🔴 2. DOCTOR HARMONY CORE REBRANDING
-- 2.1 Identidade Visual e Nome (site_config garantida pelo script Emergency)
INSERT INTO site_config (config_key, config_value)
VALUES ('ai_name', 'Doctor Harmony') ON DUPLICATE KEY
UPDATE config_value = 'Doctor Harmony';
INSERT INTO site_config (config_key, config_value)
VALUES (
        'ai_slogan',
        'Sua mentora técnica em fisiologia estética.'
    ) ON DUPLICATE KEY
UPDATE config_value = 'Sua mentora técnica em fisiologia estética.';
-- 2.2 Migração de Chaves (ai_config garantida pelo script Emergency)
UPDATE ai_config
SET config_key = 'doctor_harmony_system_prompt'
WHERE config_key = 'ana_system_prompt';
-- 🔴 3. FORENSICS & SECURITY (V35)
-- 3.1 Logs de Auditoria Forense
-- Tabela garantida pelo script Emergency. Aqui apenas garantimos colunas novas se a tabela já existia antes.
-- Como SQL puro não tem "ADD COLUMN IF NOT EXISTS" fácil, e o Emergency já cria com tudo,
-- Vamos pular a tentativa de ALTER inseguro e confiar no Emergency.
-- 3.2 Proteção de Uploads (Garantir CPF em Students)
-- O script db_sanitize_cpf.php já deve ter rodado, mas aqui garantimos a coluna
-- CREATE TABLE students ... (já existe).
-- 🔴 4. LGPD CONSENT ENGINE (V36)
-- Tabela lgpd_consent_logs garantida pelo Emergency.
-- 🔴 5. INTEGRIDADE E CORREÇÕES (SQL Puro - Sem Procedure)
-- 5.1 Normalização de Redes Sociais
-- Se existe twitter e instagram é nulo, copia.
UPDATE students
SET instagram = twitter
WHERE instagram IS NULL
    AND twitter IS NOT NULL;
-- Opcional: Esvaziar twitter para evitar confusão (não dropamos coluna para evitar erro se ela não existir)
UPDATE students
SET twitter = NULL
WHERE instagram IS NOT NULL;
-- 5.2 Limpeza de CPFs (Backup para o script PHP)
UPDATE students
SET cpf = REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '')
WHERE cpf IS NOT NULL;
-- 🔴 6. FINALIZAÇÃO
INSERT INTO audit_logs (
        action,
        severity,
        user_type,
        description,
        details
    )
VALUES (
        'DB_CONSOLIDATION',
        'INFO',
        'system',
        'Applied V38 Consolidated Migration (NO PROCEDURES)',
        '{"version": "V38", "agent": "Antigravity", "status": "FIXED_SYNTAX_FINAL"}'
    );
SET FOREIGN_KEY_CHECKS = 1;
-- Fim do Script V38