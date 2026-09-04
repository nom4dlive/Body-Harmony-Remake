-- apps/web-app/src/backend/migrations/v19_nexus_database_manager.sql
-- Setup Initial Migration Infrastructure

CREATE TABLE IF NOT EXISTS `migration_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(100) UNIQUE NOT NULL,
  `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT 0,
  `action` VARCHAR(100) NOT NULL,
  `details` JSON,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
