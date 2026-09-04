-- ==============================================================================
-- Body Harmony Nexus V3.1 — Migration V186
-- CRM Settings & Clean Real Seeds Matrix (PLAN-186)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `crm_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeds Padrão de Configurações de Aparência do CRM
INSERT INTO `crm_settings` (`setting_key`, `setting_value`)
VALUES
('sent_bubble_bg', '#DCF8C6'),
('sent_bubble_text', '#0F172A'),
('received_bubble_bg', '#FFFFFF'),
('received_bubble_text', '#0F172A'),
('whisper_bubble_bg', '#FEF3C7'),
('default_dossier_open', 'false'),
('audio_notifications_enabled', 'true')
ON DUPLICATE KEY UPDATE
    `setting_value` = VALUES(`setting_value`);

-- Limpeza de seeds fictícias na tabela crm_channels
-- Mantém a Linha 01 Oficial e limpa os telefones fictícios das outras linhas para configuração direta
UPDATE `crm_channels`
SET `phone_number` = 'Aguardando Configuração'
WHERE `instance_key` IN ('inst_juridico', 'inst_vendas', 'inst_suporte')
  AND `phone_number` LIKE '+55 (18) 99711%' OR `phone_number` LIKE '+55 (18) 99811%' OR `phone_number` LIKE '+55 (18) 99755%';
