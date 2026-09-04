-- V96 - Bot Conversion Events (Rastreamento de Funil do Bot Telegram)
-- Registra eventos do funil: start → cpf_not_found → pre_register → approved/rejected
-- Falha silenciosamente no bot (try/catch) — não impacta funcionamento.

CREATE TABLE IF NOT EXISTS bot_conversion_events (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    telegram_id   BIGINT NOT NULL,
    event_type    ENUM(
        'start',
        'cpf_found',
        'cpf_not_found',
        'pre_register_started',
        'pre_register_completed',
        'approved',
        'rejected'
    ) NOT NULL,
    user_type     ENUM('aluna', 'licenciada') DEFAULT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type  (event_type),
    INDEX idx_telegram_id (telegram_id),
    INDEX idx_created_at  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
