CREATE TABLE IF NOT EXISTS `trust_lab_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kind` enum('challenge','question','stress_test') NOT NULL,
  `title` varchar(180) DEFAULT NULL,
  `body` text NOT NULL,
  `displayName` varchar(80) DEFAULT NULL,
  `industry` varchar(120) DEFAULT NULL,
  `impactScore` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trust_lab_status_created_idx` (`status`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
