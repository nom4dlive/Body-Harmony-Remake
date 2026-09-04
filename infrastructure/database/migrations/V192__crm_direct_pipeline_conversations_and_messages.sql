-- ==============================================================================
-- Body Harmony Nexus V3.1 — Migration V192
-- Direct Pipeline MySQL Schema: crm_conversations & crm_messages (PLAN-224)
-- Eliminating Chatwoot dependency, establishing native 2-way Evolution API pipeline
-- ==============================================================================

-- 1. TABELA CANÔNICA DE CONVERSAS (INBOXES & CHATS)
CREATE TABLE IF NOT EXISTS `crm_conversations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `remote_jid` VARCHAR(150) NOT NULL,
    `instance_key` VARCHAR(100) NOT NULL DEFAULT 'inst_clinica',
    `contact_name` VARCHAR(255) DEFAULT 'Contato Sem Nome',
    `contact_phone` VARCHAR(50) DEFAULT '',
    `contact_avatar` TEXT DEFAULT NULL,
    `unread_count` INT NOT NULL DEFAULT 0,
    `last_message_content` TEXT DEFAULT NULL,
    `last_message_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `last_message_type` VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    `last_message_sender` ENUM('ME', 'CLIENT', 'HERMES_AI', 'OPERATOR') NOT NULL DEFAULT 'CLIENT',
    `status` ENUM('OPEN', 'RESOLVED', 'SNOOZED', 'PENDING') NOT NULL DEFAULT 'OPEN',
    `department` VARCHAR(100) NOT NULL DEFAULT 'Geral',
    `attendant_username` VARCHAR(100) DEFAULT NULL,
    `is_group` TINYINT(1) NOT NULL DEFAULT 0,
    `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
    `tags_json` JSON DEFAULT NULL,
    `custom_attributes_json` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_conv_instance_jid` (`instance_key`, `remote_jid`),
    INDEX `idx_conv_remote_jid` (`remote_jid`),
    INDEX `idx_conv_instance` (`instance_key`),
    INDEX `idx_conv_status` (`status`),
    INDEX `idx_conv_department` (`department`),
    INDEX `idx_conv_attendant` (`attendant_username`),
    INDEX `idx_conv_last_time` (`last_message_time`),
    INDEX `idx_conv_is_group` (`is_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA CANÔNICA DE MENSAGENS (WHATSAPP + NATIVO)
CREATE TABLE IF NOT EXISTS `crm_messages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` INT DEFAULT NULL,
    `remote_jid` VARCHAR(150) NOT NULL,
    `instance_key` VARCHAR(100) NOT NULL DEFAULT 'inst_clinica',
    `message_id` VARCHAR(150) NOT NULL,
    `is_from_me` TINYINT(1) NOT NULL DEFAULT 0,
    `sender` ENUM('ME', 'CLIENT', 'HERMES_AI', 'OPERATOR', 'SYSTEM') NOT NULL DEFAULT 'CLIENT',
    `sender_name` VARCHAR(255) DEFAULT NULL,
    `sender_phone` VARCHAR(50) DEFAULT NULL,
    `message_type` ENUM('TEXT', 'IMAGE', 'AUDIO', 'DOCUMENT', 'STICKER', 'VIDEO', 'LOCATION', 'CONTACT', 'WHISPER', 'REACTION', 'AI', 'ACTIVITY') NOT NULL DEFAULT 'TEXT',
    `content` LONGTEXT DEFAULT NULL,
    `media_url` TEXT DEFAULT NULL,
    `file_name` VARCHAR(255) DEFAULT NULL,
    `mime_type` VARCHAR(100) DEFAULT NULL,
    `file_size_bytes` BIGINT DEFAULT 0,
    `quoted_context` JSON DEFAULT NULL,
    `reactions_json` JSON DEFAULT NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'ERROR') NOT NULL DEFAULT 'SENT',
    `message_timestamp` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_msg_instance_id` (`instance_key`, `message_id`),
    INDEX `idx_msg_conversation` (`conversation_id`),
    INDEX `idx_msg_remote_jid` (`remote_jid`),
    INDEX `idx_msg_instance` (`instance_key`),
    INDEX `idx_msg_is_from_me` (`is_from_me`),
    INDEX `idx_msg_status` (`status`),
    INDEX `idx_msg_timestamp` (`message_timestamp`),
    INDEX `idx_msg_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
