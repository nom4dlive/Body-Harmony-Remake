-- ==============================================================================
-- Body Harmony Nexus V3.1 — Migration V184
-- CRM Channels CRUD & Number Realignment Matrix (PLAN-184)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `crm_channels` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `instance_key` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('WHATSAPP', 'INSTAGRAM', 'TELEGRAM') NOT NULL DEFAULT 'WHATSAPP',
    `phone_number` VARCHAR(50) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `attendant_username` VARCHAR(100) NOT NULL,
    `status` ENUM('CONNECTED', 'DISCONNECTED', 'CONNECTING') NOT NULL DEFAULT 'CONNECTED',
    `battery` VARCHAR(20) DEFAULT '100%',
    `signal` VARCHAR(50) DEFAULT 'Excelente',
    `today_sent` INT DEFAULT 0,
    `today_recv` INT DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_channel_type` (`type`),
    INDEX `idx_channel_department` (`department`),
    INDEX `idx_channel_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeds das Linhas Oficiais Iniciais
INSERT INTO `crm_channels` (`instance_key`, `name`, `type`, `phone_number`, `department`, `attendant_username`, `status`, `battery`, `signal`, `today_sent`, `today_recv`, `is_active`)
VALUES
('inst_clinica', 'Linha 01 — Clínica & Pacientes Físicos (Assis/SP)', 'WHATSAPP', '+55 (18) 99695-9486', 'Clínica', 'cibele', 'CONNECTED', '95%', 'Excelente', 154, 142, 1),
('inst_juridico', 'Linha 02 — Jurídico & Finanças (Contratos & Cobrança)', 'WHATSAPP', '+55 (18) 99711-4455', 'Jurídico', 'guilherme', 'CONNECTED', '90%', 'Excelente', 86, 78, 1),
('inst_vendas', 'Linha 03 — Vendas & Comercial (Franquias & Cursos)', 'WHATSAPP', '+55 (18) 99811-2233', 'Vendas', 'giovanna', 'CONNECTED', '98%', 'Bom', 428, 392, 1),
('inst_suporte', 'Linha 04 — Suporte às Licenciadas (Pós-Venda & Protocolos)', 'WHATSAPP', '+55 (18) 99755-6677', 'Suporte', 'guilherme', 'CONNECTED', '88%', 'Excelente', 210, 195, 1),
('inst_ig', 'Instagram Direct (@bodyharmonybrasil)', 'INSTAGRAM', 'Meta Graph API', 'Social', 'giovanna', 'CONNECTED', 'Nuvem', '100%', 94, 112, 1),
('inst_tg', 'Telegram Bot Swarm (@bodyharmony_bot)', 'TELEGRAM', 'Botfather Token', 'Social', 'guilherme', 'CONNECTED', 'Nuvem', '100%', 62, 85, 1)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `phone_number` = VALUES(`phone_number`),
    `department` = VALUES(`department`),
    `attendant_username` = VALUES(`attendant_username`);
