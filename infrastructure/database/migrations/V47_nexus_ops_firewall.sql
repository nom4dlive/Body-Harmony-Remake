-- Migration: V47 Nexus Ops & Firewall Architecture
-- Objetivo: Estruturar as tabelas forenses e operacionais do Nexus Operations.
-- Database: MySQL 8.X / InnoDB
-- 1. Refatoração da Tabela auth_logs
-- Adiciona novas colunas e índice para rastreio e mitigação de brute force.
-- Note: 'risk_score' and 'risk_details' were added in V45/V46. Adding missing geo columns and reason.
ALTER TABLE `auth_logs`
ADD COLUMN `risk_reason` TEXT DEFAULT NULL
AFTER `risk_details`,
    ADD COLUMN `city` VARCHAR(100) DEFAULT NULL
AFTER `risk_reason`,
    ADD COLUMN `region` VARCHAR(100) DEFAULT NULL
AFTER `city`,
    ADD COLUMN `isp` VARCHAR(150) DEFAULT NULL
AFTER `region`;
-- Criação do índice composto para detecção de velocidade/brute_force (Throttling)
CREATE INDEX `idx_ip_created` ON `auth_logs` (`ip_address`, `created_at`);
-- 2. Tabela: security_ip_rules (Central do Nexus Ops)
-- Gerencia o firewall dinâmico do sistema.
CREATE TABLE IF NOT EXISTS `security_ip_rules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ip_address` VARCHAR(45) NOT NULL,
    `rule_type` ENUM('ALLOW', 'BAN', 'SUSPICIOUS') NOT NULL,
    `reason` VARCHAR(255) DEFAULT NULL,
    `admin_id` INT DEFAULT NULL,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_ip_address` (`ip_address`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 3. Tabela: user_behavior_profiles
-- Armazena a "impressão digital" do comportamento normal de cada licenciada.
CREATE TABLE IF NOT EXISTS `user_behavior_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `common_cities` JSON DEFAULT NULL,
    `typical_login_hours` JSON DEFAULT NULL,
    `trust_score_base` INT DEFAULT 100,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_id` (`user_id`),
    CONSTRAINT `fk_ubp_user` FOREIGN KEY (`user_id`) REFERENCES `licenciadas` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 4. Tabela: nexus_audit_ops
-- Registra quem, no nível Admin, alterou regras de segurança (Trilha de Governança).
CREATE TABLE IF NOT EXISTS `nexus_audit_ops` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT DEFAULT NULL,
    `action` VARCHAR(100) NOT NULL,
    `target_id` VARCHAR(255) DEFAULT NULL,
    `payload_before` JSON DEFAULT NULL,
    `payload_after` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 5. Tabela: security_alerts_history
-- Alimenta o Feed do Login Guardian (Ops Center)
CREATE TABLE IF NOT EXISTS `security_alerts_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `is_resolved` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_severity_resolved` (`severity`, `is_resolved`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;