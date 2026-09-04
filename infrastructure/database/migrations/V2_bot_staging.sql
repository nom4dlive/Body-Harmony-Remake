CREATE TABLE IF NOT EXISTS `bot_cadastro_staging` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_id` bigint(20) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `type` enum('aluna','licenciada') DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
