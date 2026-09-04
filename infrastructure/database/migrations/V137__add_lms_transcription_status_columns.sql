-- ==============================================================================
-- Migration: V137__add_lms_transcription_status_columns.sql
-- Description: Adiciona colunas de controle de transcrição Whisper/SmartBook
-- Target Table: lms_lessons
-- Author: Nexus Protocol V3.1 / Antigravity
-- ==============================================================================

ALTER TABLE `lms_lessons`
ADD COLUMN `transcription_status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING' AFTER `video_url`,
ADD COLUMN `transcription_job_id` VARCHAR(64) NULL AFTER `transcription_status`,
ADD COLUMN `transcription_error` TEXT NULL AFTER `transcription_job_id`,
ADD COLUMN `transcription_completed_at` DATETIME NULL AFTER `transcription_error`,
ADD INDEX `idx_lms_lessons_transcription` (`transcription_status`);
