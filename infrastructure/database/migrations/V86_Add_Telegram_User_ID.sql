-- ==============================================================================
-- V86: Telegram Bot Integration — Add telegram_user_id columns
-- Data: 2026-03-31
-- Descrição: Permite vincular telegram_user_id a licenciadas e alunas
--            para identificação automática no bot de suporte.
-- ==============================================================================

-- 1. Licenciadas (table exists)
ALTER TABLE licenciadas
    ADD COLUMN telegram_user_id BIGINT NULL UNIQUE
    COMMENT 'Telegram user ID para vinculação com bot de suporte';

-- 2. Alunas (skip if table does not exist — will be applied when alunas table is created)
-- ALTER TABLE alunas ADD COLUMN telegram_user_id BIGINT NULL UNIQUE;
