-- Migration 003: Create settings table for configurable application settings

USE `kinderfun_db`;

CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default visit points setting
INSERT INTO `settings` (`setting_key`, `setting_value`, `description`)
VALUES ('default_visit_points', '10', 'Default poin reward per transaksi kunjungan')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;
