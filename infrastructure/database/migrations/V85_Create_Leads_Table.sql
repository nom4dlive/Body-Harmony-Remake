-- infrastructure/database/migrations/V85_Create_Leads_Table.sql

CREATE TABLE IF NOT EXISTS `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `status` enum('new', 'contacted', 'converted', 'archived') DEFAULT 'new',
  `source` varchar(50) DEFAULT 'site',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
