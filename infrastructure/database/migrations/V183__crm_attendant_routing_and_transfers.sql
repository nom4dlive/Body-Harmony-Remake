-- infrastructure/database/migrations/V183__crm_attendant_routing_and_transfers.sql
-- Matriz de Silos por Linhas, Gestão de Atendentes e Transferência de Conversas (PLAN-183)

CREATE TABLE IF NOT EXISTS `crm_attendant_lines` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NULL,
    `role` ENUM('ADMIN', 'SUPERVISOR', 'ATTENDANT') NOT NULL DEFAULT 'ATTENDANT',
    `primary_line` ENUM('CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE', 'ALL') NOT NULL DEFAULT 'CLINICA',
    `allowed_lines_json` JSON NOT NULL,
    `status` ENUM('ONLINE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'ONLINE',
    `can_transfer` TINYINT(1) NOT NULL DEFAULT 1,
    `can_view_reports` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_username` (`username`),
    INDEX `idx_primary_line` (`primary_line`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `crm_conversation_transfers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` VARCHAR(100) NOT NULL,
    `from_user` VARCHAR(100) NOT NULL,
    `to_line` ENUM('CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE') NOT NULL,
    `to_user` VARCHAR(100) NULL,
    `context_note` TEXT NOT NULL,
    `priority` ENUM('NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_conversation_id` (`conversation_id`),
    INDEX `idx_from_user` (`from_user`),
    INDEX `idx_to_line` (`to_line`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeds Oficiais das Personas (PLAN-183)
INSERT INTO `crm_attendant_lines` (`username`, `name`, `email`, `role`, `primary_line`, `allowed_lines_json`, `status`, `can_transfer`, `can_view_reports`)
VALUES
('guilherme', 'Guilherme (Jurídico & Suporte Licenciadas)', 'guilherme@bodyharmony.com.br', 'ADMIN', 'JURIDICO', '["CLINICA", "JURIDICO", "VENDAS", "SUPORTE"]', 'ONLINE', 1, 1),
('giovanna', 'Giovanna (Vendas & Cursos VIP)', 'giovanna@bodyharmony.com.br', 'ATTENDANT', 'VENDAS', '["VENDAS"]', 'ONLINE', 1, 0),
('cibele', 'Cibele (Clínica & Recepção)', 'cibele@bodyharmony.com.br', 'ATTENDANT', 'CLINICA', '["CLINICA"]', 'ONLINE', 1, 0),
('admin', 'Dra. Joselene Silva (Diretoria)', 'josi@bodyharmony.com.br', 'ADMIN', 'ALL', '["CLINICA", "JURIDICO", "VENDAS", "SUPORTE"]', 'ONLINE', 1, 1)

ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `primary_line` = VALUES(`primary_line`),
    `allowed_lines_json` = VALUES(`allowed_lines_json`),
    `can_transfer` = VALUES(`can_transfer`),
    `can_view_reports` = VALUES(`can_view_reports`);
