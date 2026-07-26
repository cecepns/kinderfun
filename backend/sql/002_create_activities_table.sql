-- Migration 002: Create activities table and add sample data

USE `kinderfun_db`;

CREATE TABLE IF NOT EXISTS `activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Kegiatan',
  `cover_image` VARCHAR(255),
  `description` LONGTEXT,
  `author` VARCHAR(100) DEFAULT 'Admin Kinderfun',
  `event_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for activities
INSERT INTO `activities` (`title`, `category`, `cover_image`, `description`, `author`, `event_date`) 
SELECT 'Lomba Mewarnai Bersama Maskot Kinderfun', 'Event', 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800', '<p>Halo Ayah &amp; Bunda! Kinderfun mengadakan <strong>Lomba Mewarnai Kreatif</strong> untuk si kecil usia 3-7 tahun.</p><p>Acara ini akan dimeriahkan oleh kedatangan Maskot Red Ant Kinderfun yang akan membagikan berbagai souvenir menarik!</p>', 'Admin Kinderfun', DATE_ADD(CURDATE(), INTERVAL 5 DAY)
WHERE NOT EXISTS (SELECT 1 FROM `activities` WHERE `id` = 1);

INSERT INTO `activities` (`title`, `category`, `cover_image`, `description`, `author`, `event_date`) 
SELECT 'Kegiatan Sensori Anak: Playing With Color Clay', 'Edukasi', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800', '<p>Melatih sensorik motorik halus si kecil melalui permainan lilin organik yang aman. Kegiatan ini dibimbing oleh instruktur berpengalaman dari Kinderfun Team.</p>', 'Admin Kinderfun', DATE_SUB(CURDATE(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM `activities` WHERE `id` = 2);
