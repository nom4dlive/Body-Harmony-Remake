-- Migration V88: Integrações de Suporte (Telegram)
ALTER TABLE licenciadas ADD COLUMN telegram_user_id BIGINT NULL UNIQUE;
