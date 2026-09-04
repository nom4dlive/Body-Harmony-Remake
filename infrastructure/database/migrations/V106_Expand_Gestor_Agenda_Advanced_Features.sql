-- ============================================================
-- Migration: V106_Expand_Gestor_Agenda_Advanced_Features.sql
-- Description: Subtarefas, Comentários, Anexos, iCal Feed e Automações da Agenda (Nexus V3.1)
-- ============================================================

-- Expand gestor_agenda_events with recurrence and approval columns
ALTER TABLE `gestor_agenda_events`
ADD COLUMN `is_recurring` TINYINT(1) NOT NULL DEFAULT 0 AFTER `metadata`,
ADD COLUMN `recurrence_freq` ENUM('diaria', 'semanal', 'mensal', 'anual') NULL AFTER `is_recurring`,
ADD COLUMN `requires_approval` TINYINT(1) NOT NULL DEFAULT 0 AFTER `recurrence_freq`;

-- Checklists / Subtasks table
CREATE TABLE IF NOT EXISTS `gestor_agenda_checklists` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_checklist_event` (`event_id`),
  CONSTRAINT `fk_checklist_event` FOREIGN KEY (`event_id`) REFERENCES `gestor_agenda_events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments / Internal discussion table
CREATE TABLE IF NOT EXISTS `gestor_agenda_comments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `admin_id` INT UNSIGNED NOT NULL,
  `comment` TEXT NOT NULL,
  `mentions` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comment_event` (`event_id`),
  CONSTRAINT `fk_comment_event` FOREIGN KEY (`event_id`) REFERENCES `gestor_agenda_events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attachments table
CREATE TABLE IF NOT EXISTS `gestor_agenda_attachments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `uploaded_by_admin_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_attachment_event` (`event_id`),
  CONSTRAINT `fk_attachment_event` FOREIGN KEY (`event_id`) REFERENCES `gestor_agenda_events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
