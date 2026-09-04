-- ============================================================
-- Migration: V110_Onboarding_Sandbox_And_Assignments.sql
-- Description: Suporte a Sandbox/Testes, Delegação por Gestor e Turmas Futuras no Onboarding (PLAN-083)
-- Date: 2026-08-23
-- Protocol: Nexus Protocol V3.1 (Doctor Harmony Protocol / PHP 8.4)
-- Constitution Invariants: REGRA 1 (Strict Contracts), REGRA 8 (Licenciadas CPF Invariant), REGRA 10 (Dual-Signature)
-- ============================================================

-- 1. Expansão da tabela licenciada_onboarding_requests para suporte a sandbox e governança
ALTER TABLE `licenciada_onboarding_requests`
  ADD COLUMN IF NOT EXISTS `is_test` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica se e um lead simulado de teste' AFTER `status`,
  ADD COLUMN IF NOT EXISTS `assigned_admin_id` INT UNSIGNED NULL COMMENT 'ID do gestor responsavel pelo acompanhamento do lead' AFTER `is_test`,
  ADD COLUMN IF NOT EXISTS `future_cohort_tag` VARCHAR(100) NULL COMMENT 'Tag de turma futura ou campanha de expansao' AFTER `assigned_admin_id`,
  ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME NULL COMMENT 'Data de arquivamento soft-delete' AFTER `updated_at`,
  ADD INDEX IF NOT EXISTS `idx_onboarding_is_test` (`is_test`),
  ADD INDEX IF NOT EXISTS `idx_onboarding_assigned_admin` (`assigned_admin_id`),
  ADD INDEX IF NOT EXISTS `idx_onboarding_deleted_at` (`deleted_at`);

-- 2. Expansão da tabela licenciada_onboarding_tokens para flag de teste
ALTER TABLE `licenciada_onboarding_tokens`
  ADD COLUMN IF NOT EXISTS `is_test` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica se e um token de teste/sandbox' AFTER `used_at`,
  ADD INDEX IF NOT EXISTS `idx_onboarding_tokens_is_test` (`is_test`);
