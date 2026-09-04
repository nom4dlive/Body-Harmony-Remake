-- infrastructure/database/migrations/V46_Admin_LGPD_Status.sql
-- Adiciona suporte a LGPD para administradores (Garantia Nexus Architecture)
-- 1. Adicionar coluna lgpd_status na tabela admin_users
ALTER TABLE admin_users
ADD COLUMN lgpd_status TEXT DEFAULT NULL
AFTER role;
-- 2. Registro de Auditoria
INSERT INTO nexus_audit_log (user_id, action, target_table, details)
VALUES (
        0,
        'SCHEMA_UPDATE',
        'admin_users',
        'Added lgpd_status column to support admin consent persistence'
    );