-- ============================================================
-- Migration: V105_Create_Gestor_Agenda_Events_Table.sql
-- Description: Sistema de Agenda Compartilhada, Pendências e Urgências do Gestor (Nexus V3.1)
-- ============================================================

CREATE TABLE IF NOT EXISTS `gestor_agenda_events` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_type` ENUM('agendamento_cliente', 'pendencia', 'urgencia', 'evento_geral') NOT NULL DEFAULT 'pendencia',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NULL,
  `priority` ENUM('baixa', 'media', 'alta', 'critica') NOT NULL DEFAULT 'media',
  `status` ENUM('pendente', 'em_andamento', 'concluido', 'cancelado', 'adiado') NOT NULL DEFAULT 'pendente',
  `client_id` BIGINT UNSIGNED NULL,
  `client_type` ENUM('licenciada', 'aluna', 'externo') NULL,
  `created_by_admin_id` INT UNSIGNED NOT NULL,
  `assigned_to_admin_id` INT UNSIGNED NULL,
  `updated_by_admin_id` INT UNSIGNED NULL,
  `color` VARCHAR(20) NULL DEFAULT '#0A3E60',
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_gestor_agenda_dates` (`start_datetime`, `end_datetime`),
  INDEX `idx_gestor_agenda_type_status` (`event_type`, `status`),
  INDEX `idx_gestor_agenda_assigned` (`assigned_to_admin_id`),
  INDEX `idx_gestor_agenda_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gestor_agenda_status_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by_admin_id` INT UNSIGNED NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_status_logs_event` (`event_id`),
  CONSTRAINT `fk_status_logs_event` FOREIGN KEY (`event_id`) REFERENCES `gestor_agenda_events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
