-- ============================================================
-- V094 — Support Feedback and Magic Tokens
-- Branch: V94-telegram-closed-loops
-- Data: 2026-04-15
-- ============================================================

-- Tabela de Feedback CSAT (1-5 estrelas)
CREATE TABLE IF NOT EXISTS support_feedback (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id   INT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES bot_support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Magic Tokens para Auto-Login Portal
CREATE TABLE IF NOT EXISTS magic_tokens (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    licenciada_id   INT NOT NULL,
    token           VARCHAR(128) NOT NULL,
    used_at         TIMESTAMP NULL DEFAULT NULL,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_token (token),
    FOREIGN KEY (licenciada_id) REFERENCES licenciadas(id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
