-- ==============================================================================
-- BODY HARMONY -- V62: SIGNAL TOWER EVOLUTION (2026-02-26)
-- OBJECTIVE: Add segmentation and read tracking to system broadcasts.
-- ==============================================================================
USE u388974772_bodyharmony_db;
-- 1. Patch system_broadcasts table
ALTER TABLE `system_broadcasts`
ADD COLUMN `target_roles` TEXT DEFAULT NULL COMMENT 'JSON array of roles like ["admin", "licenciada"]',
    ADD COLUMN `target_levels` TEXT DEFAULT NULL COMMENT 'JSON array of levels like ["standard", "platinum"]',
    ADD COLUMN `is_blocking` TINYINT(1) DEFAULT 0 COMMENT 'If 1, user must acknowledge before continuing';
-- 2. Create read logs table
CREATE TABLE IF NOT EXISTS `system_broadcast_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `broadcast_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `user_type` ENUM('admin', 'licenciada') NOT NULL,
    `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_sb_broadcast` (`broadcast_id`),
    KEY `idx_sb_user` (`user_id`, `user_type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 3. Audit
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'SCHEMA_PATCH',
        'INFO',
        'system',
        'Executed V62_Signal_Tower_Evolution.sql'
    );