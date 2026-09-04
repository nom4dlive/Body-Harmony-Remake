-- ============================================================
-- V70 — Bot Integration Maintenance
-- Squad: SDD-Busters (Audit & Fix)
-- Data: 2026-04-15
-- Garante colunas necessárias para o bot em licenciadas e alunas
-- ============================================================

-- Tentativa de adicionar colunas (Sintaxe compatível MySQL/MariaDB 10.2+)
-- Se o banco for Oracle, o admin precisará rodar scripts equivalentes manuais
-- pois a estrutura Oracle do Body Harmony é legada e customizada.

-- Licenciadas: telegram_user_id
ALTER TABLE licenciadas ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_licenciadas_tg ON licenciadas (telegram_user_id);

-- Alunas: telegram_user_id
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_alunas_tg ON alunas (telegram_user_id);

-- Alunas: is_approved
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS is_approved TINYINT(1) DEFAULT 0;
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS force_password_change TINYINT(1) DEFAULT 0;
