-- f:\Body-Harmony-Remake\infrastructure\database\migrations\V50_Create_Results_Table.sql
-- Protocol V50: Restoration of Results Table (Forensics & Public Showcase)
-- 1. Create table structure with modern nomenclature
CREATE TABLE IF NOT EXISTS `results` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `description` varchar(255) NOT NULL,
    `category` varchar(50) DEFAULT 'Gordura Localizada',
    `image_url` varchar(255) NOT NULL,
    `date` date DEFAULT NULL,
    `licenciada_id` int(11) DEFAULT NULL,
    `pinned` tinyint(1) DEFAULT 0,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `licenciada_id` (`licenciada_id`),
    CONSTRAINT `fk_results_licenciada` FOREIGN KEY (`licenciada_id`) REFERENCES `licenciadas` (`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- 2. Audit Log
INSERT INTO audit_logs (action, severity, user_type, description)
VALUES (
        'MIGRATION_V50',
        'INFO',
        'system',
        'Protocol V50: Restored missing results table with modern nomenclature.'
    );