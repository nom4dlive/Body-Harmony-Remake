-- ==============================================================================
-- V87: WhatsApp Bot Integration — Add whatsapp_number columns
-- Data: 2026-03-31
-- Descrição: Permite vincular whatsapp_number a licenciadas e alunas
--            para identificação automática no bot de suporte WhatsApp.
-- ==============================================================================

ALTER TABLE licenciadas
    ADD COLUMN whatsapp_number VARCHAR(20) NULL UNIQUE
    COMMENT 'WhatsApp number para vinculacao com bot de suporte';

ALTER TABLE alunas
    ADD COLUMN whatsapp_number VARCHAR(20) NULL UNIQUE
    COMMENT 'WhatsApp number para vinculacao com bot de suporte';
