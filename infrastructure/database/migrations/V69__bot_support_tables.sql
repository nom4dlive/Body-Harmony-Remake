-- ============================================================
-- V69 — Bot Support Tables
-- Squad: chat-wizards | Gepeto do Código
-- Data: 2026-04-15
-- Re-executável com segurança (IF NOT EXISTS)
-- ============================================================

-- Estado de conversa por chat_id (máquina de estados)
CREATE TABLE IF NOT EXISTS bot_sessions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  chat_id    BIGINT NOT NULL,
  state      VARCHAR(50) NOT NULL DEFAULT 'idle',
  data_json  LONGTEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chat_id (chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tickets de suporte encaminhados ao grupo de staff
CREATE TABLE IF NOT EXISTS bot_support_tickets (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  chat_id           BIGINT NOT NULL,
  user_name         VARCHAR(100) NULL,
  telegram_username VARCHAR(100) NULL,
  message           TEXT NOT NULL,
  group_message_id  INT NULL,
  status            ENUM('open','attending','closed') DEFAULT 'open',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_chat_id (chat_id),
  KEY idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
