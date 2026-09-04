-- ==============================================================================
-- Body Harmony Nexus V3.1 - Database Migration V189
-- Description: Hermes AI Intelligence, Action Space & Copilot Governance
-- Target Engine: MySQL 8.0+ / MariaDB 10.6+
-- ==============================================================================

-- 1. Tabela de Prompts Customizados e Ferramentas por Linha do CRM
CREATE TABLE IF NOT EXISTS `crm_hermes_prompts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `line_code` VARCHAR(30) NOT NULL UNIQUE,
    `line_name` VARCHAR(100) NOT NULL,
    `system_prompt` TEXT NOT NULL,
    `temperature` DECIMAL(3,2) DEFAULT 0.40,
    `max_tokens` INT DEFAULT 800,
    `is_active` TINYINT(1) DEFAULT 1,
    `tools_enabled_json` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_line_code` (`line_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir Prompts Padrão do Nexus V4.3
INSERT INTO `crm_hermes_prompts` (`line_code`, `line_name`, `system_prompt`, `temperature`, `max_tokens`, `is_active`, `tools_enabled_json`)
VALUES 
(
    'CLINICA', 
    'Linha 01 — Clínica (Cibele)', 
    'Você é o Copiloto da Clínica Body Harmony especializado em acolhimento, triagem de queixas corporais (gordura localizada, flacidez, celulite) e esclarecimento de tratamentos de eletroestimulação. Seu tom é caloroso, acolhedor e profissional. Quando o paciente desejar agendar, colete o melhor horário e utilize a ferramenta google_calendar_schedule. Nunca forneça diagnósticos médicos invasivos.',
    0.35, 
    700, 
    1, 
    '["google_calendar_schedule", "crm_tag_lead", "crm_transfer_agent"]'
),
(
    'VENDAS', 
    'Linha 03 — Vendas & Cursos (Giovanna)', 
    'Você é o Especialista Comercial da Body Harmony. Seu objetivo é apresentar a Formação Profissional em Eletroestimulação e os ingressos para o Congresso Body Harmony. Apresente os diferenciais de faturamento das licenciadas e utilize crm_generate_pix para enviar a chave de pagamento segura quando o cliente confirmar a compra.',
    0.45, 
    800, 
    1, 
    '["crm_generate_pix", "crm_move_kanban", "crm_transfer_agent"]'
),
(
    'SUPORTE', 
    'Linha 04 — Suporte Licenciadas (Guilherme)', 
    'Você é o Suporte VIP das Licenciadas Body Harmony. Auxilie as profissionais com parâmetros de protocolos clínicos, dúvidas no uso dos equipamentos e acesso ao portal de alunas LMS. Seja ágil, direto e resolutivo.',
    0.30, 
    600, 
    1, 
    '["crm_tag_lead", "crm_transfer_agent"]'
),
(
    'JURIDICO', 
    'Linha 02 — Jurídico & Finanças (Guilherme)', 
    'MODO COPILOT PRIVADO: Esta linha é 100% gerenciada por operadores humanos. Atue apenas gerando notas internas confidenciais para apoio do advogado/gestor financeiro.',
    0.20, 
    500, 
    0, 
    '["crm_transfer_agent"]'
)
ON DUPLICATE KEY UPDATE 
    `system_prompt` = VALUES(`system_prompt`),
    `tools_enabled_json` = VALUES(`tools_enabled_json`);

-- 2. Fila de Lembretes Automáticos Anti No-Show
CREATE TABLE IF NOT EXISTS `crm_auto_reminders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `event_id` VARCHAR(100) NOT NULL,
    `patient_phone` VARCHAR(30) NOT NULL,
    `patient_name` VARCHAR(200) NOT NULL,
    `appointment_time` DATETIME NOT NULL,
    `reminder_type` ENUM('24H', '2H') NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_reminder_time` (`appointment_time`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Resumos Executivos de Dossiê por IA
CREATE TABLE IF NOT EXISTS `crm_dossier_summaries` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` INT NOT NULL,
    `patient_phone` VARCHAR(30) NOT NULL,
    `summary_text` TEXT NOT NULL,
    `action_items_json` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_conv_dossier` (`conversation_id`, `patient_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
