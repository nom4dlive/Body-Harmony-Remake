-- V91: Telegram Bot Approval Flow (is_approved flag)
-- Adiciona a coluna is_approved na tabela alunas para suportar o status pending no fluxo do Telegram

ALTER TABLE alunas ADD COLUMN is_approved TINYINT(1) DEFAULT 1;
CREATE INDEX idx_alunas_approved ON alunas(is_approved);
