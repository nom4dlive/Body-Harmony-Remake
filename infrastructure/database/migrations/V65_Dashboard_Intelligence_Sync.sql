-- Migration V65: Dashboard Intelligence Sync
-- Descrição: Adiciona persistência de última aula assistida para o Dashboard Bento
-- Autor: Antigravity AI (Nexus Protocol V3.1)
USE u388974772_bodyharmony_db;
-- 1. Cria a tabela de logs que faltou na V62 caso o Oracle/MySQL Strict tenha dropado
CREATE TABLE IF NOT EXISTS system_broadcast_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    broadcast_id INT NOT NULL,
    user_id INT NOT NULL,
    user_type ENUM('admin', 'licenciada') NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_sb_broadcast (broadcast_id),
    KEY idx_sb_user (user_id, user_type)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 2. Adiciona a coluna para o Dashboard
ALTER TABLE licenciadas
ADD COLUMN last_active_lesson_id INT NULL
AFTER password_hash;
-- Tenta adicionar a chave estrangeira
ALTER TABLE licenciadas
ADD CONSTRAINT fk_licenciadas_last_lesson FOREIGN KEY (last_active_lesson_id) REFERENCES lms_lessons(id) ON DELETE
SET NULL;
-- Log de Auditoria
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_PATCH',
        'INFO',
        'system',
        'Executed V65_Dashboard_Intelligence_Sync.sql'
    );