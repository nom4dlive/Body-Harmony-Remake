-- ==============================================================================
-- BODY HARMONY -- V39 PART 3: CREATE AUTH LOGS
-- STATUS: CRITICAL - Fixes 500 Error on Login
-- DESCRIPTION: Creates the missing auth_logs table required by AuthController
-- ==============================================================================
USE u388974772_bodyharmony_db;
CREATE TABLE IF NOT EXISTS `auth_logs` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) DEFAULT NULL,
    `email` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `ip_address` VARCHAR(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `user_agent` TEXT COLLATE utf8mb4_unicode_ci,
    `success` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_auth_logs_email` (`email`),
    KEY `idx_auth_logs_ip` (`ip_address`),
    KEY `idx_auth_logs_created` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Optional: Inspect student status to see why no active students found
-- SELECT count(*) as total_students, sum(is_active) as active_count FROM students;