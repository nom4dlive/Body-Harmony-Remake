-- infrastructure/database/migrations/V32_Lms_Certificates_And_Config_History.sql
-- Nexus Guard V3.1 - Migration for Certificates and Site Config History Tables

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Modify lms_quiz_attempts to support Alunas
ALTER TABLE `lms_quiz_attempts` MODIFY `licenciada_id` INT(11) DEFAULT NULL;

SET @col_exists_qa_aluna = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'lms_quiz_attempts' 
    AND COLUMN_NAME = 'aluna_id'
);

SET @sql_add_qa_aluna = IF(@col_exists_qa_aluna = 0,
    'ALTER TABLE lms_quiz_attempts ADD COLUMN aluna_id INT(11) DEFAULT NULL, ADD CONSTRAINT fk_quiz_att_aluna FOREIGN KEY (aluna_id) REFERENCES alunas (id) ON DELETE CASCADE',
    'SELECT "lms_quiz_attempts.aluna_id already exists" as status'
);
PREPARE stmt FROM @sql_add_qa_aluna;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Create lms_certificates table (Supports both Licenciadas and Alunas)
CREATE TABLE IF NOT EXISTS `lms_certificates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `licenciada_id` INT(11) DEFAULT NULL,
  `aluna_id` INT(11) DEFAULT NULL,
  `module_id` INT(11) NOT NULL,
  `score` FLOAT NOT NULL,
  `hash` VARCHAR(64) NOT NULL,
  `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_certificate_hash` (`hash`),
  CONSTRAINT `fk_cert_licenciada` FOREIGN KEY (`licenciada_id`) REFERENCES `licenciadas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_aluna` FOREIGN KEY (`aluna_id`) REFERENCES `alunas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_module` FOREIGN KEY (`module_id`) REFERENCES `lms_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create site_config_history table to support Undo/Redo revisions
CREATE TABLE IF NOT EXISTS `site_config_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `config_data` JSON NOT NULL,
  `updated_by` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_config_hist_admin` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
