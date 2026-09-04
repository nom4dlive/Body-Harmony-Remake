-- ==============================================================================
-- Body Harmony Nexus V3.1 — Migration V187
-- Sincronização Bidirecional com Google Calendar & Idempotência de Eventos (PLAN-CRM-V4)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Garantir colunas de sincronização e conciliação em gestor_agenda_events
ALTER TABLE gestor_agenda_events
    ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255) NULL AFTER id,
    ADD COLUMN IF NOT EXISTS google_meet_link VARCHAR(500) NULL AFTER google_event_id,
    ADD COLUMN IF NOT EXISTS google_html_link VARCHAR(500) NULL AFTER google_meet_link,
    ADD COLUMN IF NOT EXISTS sync_status ENUM('PENDING', 'SYNCED', 'FAILED') NOT NULL DEFAULT 'PENDING' AFTER status,
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL AFTER sync_status;

-- 2. Adicionar índices para consultas de alta performance
ALTER TABLE gestor_agenda_events
    ADD INDEX IF NOT EXISTS idx_google_event_id (google_event_id),
    ADD INDEX IF NOT EXISTS idx_sync_status (sync_status);

-- 3. Tabela de Mídias e Anexos do CRM para Rastreabilidade Forense
CREATE TABLE IF NOT EXISTS crm_media_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    message_id VARCHAR(100) NULL,
    sender VARCHAR(50) NOT NULL DEFAULT 'ME',
    media_type ENUM('IMAGE', 'AUDIO', 'DOCUMENT', 'VIDEO') NOT NULL,
    ile_name VARCHAR(255) NOT NULL,
    ile_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    ile_size_bytes BIGINT NOT NULL DEFAULT 0,
    caption TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_media_conv (conversation_id),
    INDEX idx_media_type (media_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
