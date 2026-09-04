-- infrastructure/database/migrations/V109__rbac_departmental_and_multi_agenda.sql
-- Nexus Protocol V3.1 - RBAC Departamental, Multi-Agenda Isolada, Compartilhamento e Supervisão

-- 1. Departamentos
CREATE TABLE IF NOT EXISTS `admin_departments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT '#0A3E60',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Cargos / Roles
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `hierarchy_level` INT NOT NULL DEFAULT 4 COMMENT '1: Superadmin, 2: Admin/Diretoria, 3: Gestor/Supervisor, 4: Operacional, 5: Atendimento',
  `permissions_json` JSON NULL COMMENT 'Matriz granular de permissões por módulo',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `admin_departments` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_dept_role_slug` (`department_id`, `slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Compartilhamento de Agenda Completa (Delegação)
CREATE TABLE IF NOT EXISTS `gestor_agenda_shares` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `owner_admin_id` INT NOT NULL,
  `shared_with_admin_id` INT NOT NULL,
  `permission_level` ENUM('read_only', 'can_edit') NOT NULL DEFAULT 'read_only',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shared_with_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_agenda_share` (`owner_admin_id`, `shared_with_admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Participantes e Co-responsáveis por Evento
CREATE TABLE IF NOT EXISTS `gestor_agenda_event_participants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `admin_id` INT NOT NULL,
  `role_type` ENUM('co_responsible', 'invited') NOT NULL DEFAULT 'co_responsible',
  `status` ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'accepted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `gestor_agenda_events` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_event_participant` (`event_id`, `admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Auto-heal colunas em admin_users e gestor_agenda_events
ALTER TABLE `admin_users` ADD COLUMN IF NOT EXISTS `department_id` INT UNSIGNED NULL;
ALTER TABLE `admin_users` ADD COLUMN IF NOT EXISTS `role_id` INT UNSIGNED NULL;
ALTER TABLE `admin_users` ADD COLUMN IF NOT EXISTS `supervisor_id` INT NULL;

ALTER TABLE `gestor_agenda_events` ADD COLUMN IF NOT EXISTS `is_private` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `gestor_agenda_events` ADD COLUMN IF NOT EXISTS `department_id` INT UNSIGNED NULL;

-- 6. Seeds dos 4 Departamentos Oficiais
INSERT INTO `admin_departments` (`id`, `name`, `slug`, `description`, `color`) VALUES
(1, 'Diretoria & Presidência', 'diretoria', 'Gestão estratégica, expansão de franquias e homologações finais', '#0A3E60'),
(2, 'Comercial & Vendas', 'comercial', 'Prospecção de candidatas, fechamento de franquias e credenciamento', '#ED7E13'),
(3, 'Atendimento & Suporte', 'suporte', 'Suporte às licenciadas, dúvidas operacionais e relacionamento', '#10B981'),
(4, 'Pedagógico & Treinamento', 'pedagogico', 'Gestão do LMS, cursos, aulas gravadas e materiais técnicos', '#8B5CF6')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`), `color` = VALUES(`color`);

-- 7. Seeds dos Cargos Fundamentais
INSERT INTO `admin_roles` (`id`, `department_id`, `name`, `slug`, `hierarchy_level`, `permissions_json`) VALUES
(1, 1, 'Diretora Executiva', 'diretora-executiva', 1, '{"agenda": "all", "onboarding": "manage", "contracts": "manage", "licenciadas": "manage", "financial": "manage", "rbac": "manage"}'),
(2, 1, 'Gerente Geral', 'gerente-geral', 2, '{"agenda": "all", "onboarding": "manage", "contracts": "manage", "licenciadas": "manage", "financial": "manage", "rbac": "manage"}'),
(3, 2, 'Gerente Comercial', 'gerente-comercial', 3, '{"agenda": "team", "onboarding": "manage", "contracts": "manage", "licenciadas": "view", "financial": "view", "rbac": "none"}'),
(4, 2, 'Consultora de Vendas', 'consultora-vendas', 4, '{"agenda": "own", "onboarding": "manage", "contracts": "view", "licenciadas": "none", "financial": "none", "rbac": "none"}'),
(5, 3, 'Líder de Atendimento', 'lider-atendimento', 3, '{"agenda": "team", "onboarding": "view", "contracts": "view", "licenciadas": "manage", "financial": "none", "rbac": "none"}'),
(6, 3, 'Atendente de Suporte', 'atendente-suporte', 5, '{"agenda": "own", "onboarding": "none", "contracts": "none", "licenciadas": "view", "financial": "none", "rbac": "none"}'),
(7, 4, 'Coordenador Pedagógico', 'coordenador-pedagogico', 3, '{"agenda": "team", "onboarding": "none", "contracts": "none", "licenciadas": "manage", "financial": "none", "rbac": "none"}')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `hierarchy_level` = VALUES(`hierarchy_level`), `permissions_json` = VALUES(`permissions_json`);
