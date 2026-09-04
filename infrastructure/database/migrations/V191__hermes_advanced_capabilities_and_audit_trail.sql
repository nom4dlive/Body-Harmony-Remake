-- ==============================================================================
-- Body Harmony Nexus V3.1 - Database Migration V191
-- Description: Hermes Advanced Capabilities, Patient Long-Term Memory, 
--              Clinical Knowledge Base (RAG) & AI Audit Trail
-- Target Engine: MySQL 8.0+ / MariaDB 10.6+
-- ==============================================================================

-- 1. Tabela de Trilha Forense e Auditoria de Ações da IA
CREATE TABLE IF NOT EXISTS `crm_hermes_audit_trail` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` INT NOT NULL,
    `line_code` VARCHAR(30) NOT NULL,
    `action_type` VARCHAR(50) NOT NULL,
    `user_input` TEXT DEFAULT NULL,
    `ai_output` TEXT DEFAULT NULL,
    `tool_name` VARCHAR(50) DEFAULT NULL,
    `sentiment_status` ENUM('POSITIVE', 'NEUTRAL', 'URGENT_FRUSTRATION') DEFAULT 'NEUTRAL',
    `execution_time_ms` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_line` (`line_code`, `created_at`),
    INDEX `idx_audit_conv` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Memória Longa do Paciente (Soul & Long-Term Memory)
CREATE TABLE IF NOT EXISTS `crm_patient_longterm_memory` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `patient_phone` VARCHAR(30) NOT NULL,
    `patient_name` VARCHAR(200) NOT NULL,
    `memory_key` VARCHAR(100) NOT NULL,
    `memory_value` TEXT NOT NULL,
    `confidence` DECIMAL(3,2) DEFAULT 0.95,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_phone_key` (`patient_phone`, `memory_key`),
    INDEX `idx_phone_mem` (`patient_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Base de Conhecimento Científica & Protocolos Clínicos (RAG)
CREATE TABLE IF NOT EXISTS `crm_clinical_knowledge_base` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `protocol_title` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `frequency_hz` VARCHAR(30) NOT NULL,
    `pulse_width_us` VARCHAR(30) NOT NULL,
    `clinical_indication` TEXT NOT NULL,
    `contraindications` TEXT NOT NULL,
    `body_regions` VARCHAR(255) NOT NULL,
    `reference_notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_rag_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir Protocolos Oficiais da Dra. Joselene Silva
INSERT INTO `crm_clinical_knowledge_base` 
(`protocol_title`, `category`, `frequency_hz`, `pulse_width_us`, `clinical_indication`, `contraindications`, `body_regions`, `reference_notes`)
VALUES
(
    'Protocolo 3S — Tonificação & Hipertrofia Muscular',
    'ESTETICA_CORPORAL',
    '85 Hz',
    '350 µs',
    'Aumento de tônus, definição do abdômen, glúteos e coxas. Estímulo direto de fibras de contração rápida tipo II.',
    'Gestantes, portadores de marcapasso cardíaco, trombose ativa e processos inflamatórios agudos.',
    'Abdômen, Glúteos, Quadríceps, Bíceps',
    'Sessões de 20 minutos equivalem a até 36.000 contrações musculares supramáximas.'
),
(
    'Protocolo 3S — Remodelagem, Celulite & Estímulo de Colágeno',
    'ESTETICA_CORPORAL',
    '40 Hz',
    '300 µs',
    'Tratamento de celulite graus I a III, melhora da microcirculação e compactação do tecido adiposo subdérmico.',
    'Neoplasias na região, infecções cutâneas ativas.',
    'Flancos, Culotes, Posterior de Coxa, Subglúteo',
    'Combinar com ingestão hídrica de 500ml antes e após o procedimento.'
),
(
    'Protocolo 3S — Drenagem Linfática & Recuperação Muscular',
    'REABILITACAO',
    '4 Hz',
    '200 µs',
    'Alívio de dores musculares tardias (DOMS), drenagem de edemas, relaxamento e desintoxicação tecidual.',
    'Trombose venosa profunda não tratada, insuficiência cardíaca descompensada.',
    'Corpo Inteiro (Full Body), Membros Inferiores',
    'Excelente para dias pós-treino intenso ou pós-cirúrgico tardio sob liberação médica.'
),
(
    'Protocolo 3S — Fortalecimento do Assoalho Pélvico',
    'SAUDE_FEMININA',
    '25 Hz',
    '250 µs',
    'Prevenção de incontinência urinária de esforço, reabilitação pós-parto e fortalecimento do core profundo.',
    'Gestação ativa, DIU de cobre recente (menos de 30 dias), infecção urinária ativa.',
    'Região Pélvica, Base de Glúteos, Core Inferior',
    'Protocolo de alta adesão clínica com evolução perceptível em 4 a 6 sessões.'
)
ON DUPLICATE KEY UPDATE 
    `clinical_indication` = VALUES(`clinical_indication`),
    `reference_notes` = VALUES(`reference_notes`);
