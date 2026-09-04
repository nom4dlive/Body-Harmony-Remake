-- ============================================================
-- V70: Aluna CRUD Enhancement
-- Data: 2026-05-05
-- Descrição: Adiciona campos phone e updated_at à tabela alunas
--            para suportar CRUD completo no Portal Gestor e Nexus.
-- ============================================================

-- 1. Campo telefone/WhatsApp (opcional)
ALTER TABLE alunas ADD COLUMN phone VARCHAR(20) NULL AFTER cpf;

-- 2. Campo updated_at para rastreabilidade de alterações
ALTER TABLE alunas ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
