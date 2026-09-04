<?php
// apps/web-app/src/backend/api/v1/crm/migrate_crm_tables.php
// Body Harmony Nexus V3.1 — Safe In-Production DDL Provisioner for CRM Tables (V184, V192)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

global $pdo, $db;
$dbConn = $pdo ?? $db;

if (!$dbConn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$results = [];

try {
    // 1. Criar crm_conversations
    $dbConn->exec("
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
    ");
    $results['crm_conversations'] = 'CREATED_OR_EXISTS';

    // 2. Criar crm_messages
    $dbConn->exec("
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
    ");
    $results['crm_messages'] = 'CREATED_OR_EXISTS';

    // 3. Criar crm_channels
    $dbConn->exec("
        CREATE TABLE IF NOT EXISTS `crm_channels` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `instance_key` VARCHAR(100) NOT NULL UNIQUE,
            `name` VARCHAR(255) NOT NULL,
            `type` ENUM('WHATSAPP', 'INSTAGRAM', 'TELEGRAM') NOT NULL DEFAULT 'WHATSAPP',
            `phone_number` VARCHAR(50) NOT NULL,
            `department` VARCHAR(100) NOT NULL,
            `attendant_username` VARCHAR(100) NOT NULL,
            `status` ENUM('CONNECTED', 'DISCONNECTED', 'CONNECTING') NOT NULL DEFAULT 'CONNECTED',
            `battery` VARCHAR(20) DEFAULT '100%',
            `signal` VARCHAR(50) DEFAULT 'Excelente',
            `today_sent` INT DEFAULT 0,
            `today_recv` INT DEFAULT 0,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX `idx_channel_type` (`type`),
            INDEX `idx_channel_department` (`department`),
            INDEX `idx_channel_active` (`is_active`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $results['crm_channels'] = 'CREATED_OR_EXISTS';

    // 4. Padronizar Collation das Tabelas do CRM (Evitar Collation Mismatch)
    $dbConn->exec("ALTER TABLE `crm_conversations` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $dbConn->exec("ALTER TABLE `crm_messages` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $dbConn->exec("ALTER TABLE `crm_channels` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $results['collation_alignment'] = 'ALIGNED_TO_UTF8MB4_UNICODE_CI';

    // 5. Inserir Canais Oficiais Padrão
    $dbConn->exec("
        INSERT INTO `crm_channels` (`instance_key`, `name`, `type`, `phone_number`, `department`, `attendant_username`, `status`, `battery`, `signal`, `today_sent`, `today_recv`, `is_active`)
        VALUES
        ('inst_clinica', 'Linha 01 — Clínica & Pacientes Físicos (Assis/SP)', 'WHATSAPP', '+55 (18) 99695-9486', 'Clínica', 'cibele', 'CONNECTED', '95%', 'Excelente', 0, 0, 1),
        ('inst_juridico', 'Linha 02 — Jurídico & Finanças (Contratos & Cobrança)', 'WHATSAPP', '+55 (18) 99711-4455', 'Jurídico', 'guilherme', 'CONNECTED', '90%', 'Excelente', 0, 0, 1),
        ('inst_comercial', 'Linha 03 — Vendas & Comercial (Franquias & Cursos)', 'WHATSAPP', '+55 (18) 99811-2233', 'Vendas', 'giovanna', 'CONNECTED', '98%', 'Bom', 0, 0, 1),
        ('inst_licenciadas', 'Linha 04 — Suporte às Licenciadas (Pós-Venda & Protocolos)', 'WHATSAPP', '+55 (18) 99755-6677', 'Suporte', 'guilherme', 'CONNECTED', '88%', 'Excelente', 0, 0, 1),
        ('inst_ig', 'Instagram Direct (@bodyharmonybrasil)', 'INSTAGRAM', 'Meta Graph API', 'Social', 'giovanna', 'CONNECTED', 'Nuvem', '100%', 0, 0, 1),
        ('inst_tg', 'Telegram Bot Swarm (@bodyharmony_bot)', 'TELEGRAM', 'Botfather Token', 'Social', 'guilherme', 'CONNECTED', 'Nuvem', '100%', 0, 0, 1)
        ON DUPLICATE KEY UPDATE
            `name` = VALUES(`name`),
            `phone_number` = VALUES(`phone_number`),
            `department` = VALUES(`department`),
            `attendant_username` = VALUES(`attendant_username`);
    ");
    $results['crm_channels_seeds'] = 'SEEDED';

    echo json_encode([
        'success' => true,
        'message' => 'Tabelas do CRM migradas com sucesso no MySQL de Produção',
        'results' => $results,
        'timestamp' => date('c')
    ]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao executar DDL das tabelas do CRM: ' . $e->getMessage()
    ]);
}
