-- ==============================================================================
-- BODY HARMONY -- MIGRATION V98: LMS EXCLUSIVE LESSONS
-- ==============================================================================

-- 1. Add is_exclusive column to lms_modules
ALTER TABLE `lms_modules` ADD COLUMN `is_exclusive` TINYINT(1) DEFAULT 0 AFTER `is_active`;

-- 2. Create licenciada_course_access table
CREATE TABLE IF NOT EXISTS `licenciada_course_access` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `licenciada_id` INT(11) NOT NULL,
  `module_id` INT(11) NOT NULL,
  `granted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `granted_by` INT(11) DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_licenciada_module_access` (`licenciada_id`, `module_id`),
  CONSTRAINT `fk_licenciada_access_licenciada` FOREIGN KEY (`licenciada_id`) REFERENCES `licenciadas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_licenciada_access_module` FOREIGN KEY (`module_id`) REFERENCES `lms_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_licenciada_access_admin` FOREIGN KEY (`granted_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Log migration audit entry
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES ('DATABASE_MIGRATION_V98', 'INFO', 'system', 'Applied migration V98: LMS Exclusive Lessons and Licenciada Access Control');
