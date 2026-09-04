-- V33_Fix_Missing_Nexus_Rules.sql
-- Recovering missing nexus_security_rules table definition
CREATE TABLE IF NOT EXISTS `nexus_security_rules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `rule_key` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Chave única da regra (ex: MAX_LOGIN_ATTEMPTS)',
    `rule_value` TEXT COMMENT 'Valor da regra (pode ser JSON)',
    `description` VARCHAR(255) COMMENT 'Descrição human-readable',
    `is_active` BOOLEAN DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by` INT COMMENT 'ID do admin que alterou',
    FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Seed initial rules if they don't exist
INSERT INTO `nexus_security_rules` (
        `rule_key`,
        `rule_value`,
        `description`,
        `updated_by`
    )
VALUES (
        'MAX_LOGIN_ATTEMPTS',
        '5',
        'Número máximo de tentativas de login antes do bloqueio temporário',
        5
    ),
    (
        'LOCKOUT_DURATION_MINUTES',
        '15',
        'Tempo de bloqueio em minutos após exceder tentativas',
        5
    ),
    (
        'WHITELIST_IPS',
        '["127.0.0.1", "::1"]',
        'Lista de IPs permitidos para bypass (JSON)',
        5
    ),
    ('BLACKLIST_IPS', '[]', 'Banned IPs', 5),
    (
        'ALLOW_REGISTRATION',
        'false',
        'Permitir novos cadastros públicos de licenciadas',
        5
    ) ON DUPLICATE KEY
UPDATE `rule_key` = `rule_key`;