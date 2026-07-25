-- Kinderfun Playground Database Schema
CREATE DATABASE IF NOT EXISTS `kinderfun_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kinderfun_db`;

-- Drop existing tables if re-initialization is needed
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `staff_attendance`;
DROP TABLE IF EXISTS `point_redemptions`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `souvenirs`;
DROP TABLE IF EXISTS `packages`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table (Admin & Staff)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `phone` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Customers Table
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_name` VARCHAR(100) NOT NULL,
  `child_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100),
  `points_balance` INT DEFAULT 0,
  `is_member` TINYINT(1) DEFAULT 0,
  `member_expiry` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Packages Table
CREATE TABLE `packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `duration_hours` INT DEFAULT 1,
  `is_member_package` TINYINT(1) DEFAULT 0,
  `visits_count` INT DEFAULT 1,
  `validity_months` INT DEFAULT 0,
  `weekday_price` DECIMAL(12,2) NOT NULL,
  `weekend_price` DECIMAL(12,2) NOT NULL,
  `best_value` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Transactions Table
CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `trx_code` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `package_id` INT NOT NULL,
  `package_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `is_weekend` TINYINT(1) DEFAULT 0,
  `points_earned` INT DEFAULT 10,
  `payment_method` ENUM('cash', 'qris', 'transfer', 'card') DEFAULT 'qris',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Souvenirs Table
CREATE TABLE `souvenirs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `point_cost` INT NOT NULL,
  `stock` INT DEFAULT 0,
  `description` TEXT,
  `image_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Point Redemptions Table
CREATE TABLE `point_redemptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `redemption_code` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `souvenir_id` INT NOT NULL,
  `souvenir_name` VARCHAR(100) NOT NULL,
  `points_spent` INT NOT NULL,
  `qty` INT DEFAULT 1,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`souvenir_id`) REFERENCES `souvenirs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Staff Attendance Table
CREATE TABLE `staff_attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `staff_name` VARCHAR(100) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `check_in_time` TIME,
  `check_out_time` TIME,
  `status` ENUM('present', 'late', 'absent', 'on_leave') DEFAULT 'present',
  `notes` TEXT,
  `photo_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Expenses Table
CREATE TABLE `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Operasional',
  `amount` DECIMAL(12,2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA
-- Users (Password stored as plaintext for seed simplicity, or handled in backend)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`) VALUES
(1, 'Admin Kinderfun', 'admin@kinderfun.com', 'admin123', 'admin', '082188886358'),
(2, 'Staff Kasir 1', 'kasir1@kinderfun.com', 'staff123', 'staff', '081234567890'),
(3, 'Staff Operator 2', 'staff2@kinderfun.com', 'staff123', 'staff', '081298765432');

-- Play Packages matching poster JSON
INSERT INTO `packages` (`id`, `name`, `duration_hours`, `is_member_package`, `visits_count`, `validity_months`, `weekday_price`, `weekend_price`, `best_value`) VALUES
(1, '1 Jam', 1, 0, 1, 0, 30000.00, 40000.00, 0),
(2, '2 Jam', 2, 0, 1, 0, 50000.00, 70000.00, 0),
(3, '3 Jam', 3, 0, 1, 0, 70000.00, 90000.00, 1),
(4, 'Member Package', 0, 1, 10, 3, 250000.00, 350000.00, 0);

-- Customers
INSERT INTO `customers` (`id`, `parent_name`, `child_name`, `phone`, `email`, `points_balance`, `is_member`) VALUES
(1, 'Bunda Ani', 'Rizky', '081311112222', 'ani@gmail.com', 40, 1),
(2, 'Ayah Budi', 'Kiki', '081333334444', 'budi@gmail.com', 20, 0),
(3, 'Mama Citra', 'Nala & Al', '081555556666', 'citra@gmail.com', 70, 1);

-- Souvenirs / Merchandise
INSERT INTO `souvenirs` (`id`, `name`, `point_cost`, `stock`, `description`, `image_url`) VALUES
(1, 'Tote Bag Kinderfun', 10, 50, 'Kanvas spunbond ramah lingkungan bermotif Maskot Kinderfun', '/uploads/totebag.png'),
(2, 'Botol Minum Fun Tumbler', 20, 30, 'Tumbler air minum anak BPA-Free 500ml', '/uploads/tumbler.png'),
(3, 'Topi Kinderfun Play', 15, 25, 'Topi anak warna-warni lucu bordir Kinderfun', '/uploads/hat.png'),
(4, 'Boneka Mascot Red Ant', 30, 15, 'Boneka mewah plushie semut merah ikonik Kinderfun', '/uploads/mascot.png');

-- Sample Transactions
INSERT INTO `transactions` (`trx_code`, `customer_id`, `package_id`, `package_name`, `amount`, `is_weekend`, `points_earned`, `payment_method`, `created_at`) VALUES
('TRX-20260724-001', 1, 3, '3 Jam', 70000.00, 0, 10, 'qris', NOW() - INTERVAL 2 DAY),
('TRX-20260724-002', 2, 2, '2 Jam', 70000.00, 1, 10, 'cash', NOW() - INTERVAL 1 DAY),
('TRX-20260724-003', 3, 4, 'Member Package', 250000.00, 0, 10, 'qris', NOW());

-- Sample Souvenir Redemptions
INSERT INTO `point_redemptions` (`redemption_code`, `customer_id`, `souvenir_id`, `souvenir_name`, `points_spent`, `qty`, `created_at`) VALUES
('RDM-20260724-001', 3, 1, 'Tote Bag Kinderfun', 10, 1, NOW() - INTERVAL 1 DAY);

-- Sample Staff Attendance
INSERT INTO `staff_attendance` (`user_id`, `staff_name`, `attendance_date`, `check_in_time`, `check_out_time`, `status`, `notes`) VALUES
(2, 'Staff Kasir 1', CURDATE(), '08:45:00', '17:00:00', 'present', 'Tepat waktu'),
(3, 'Staff Operator 2', CURDATE(), '09:12:00', '17:05:00', 'late', 'Terlambat 12 menit');

-- Sample Expenses
INSERT INTO `expenses` (`title`, `category`, `amount`, `expense_date`, `description`) VALUES
('Pembelian Disinfektan & Pembersih Mainan', 'Kebersihan', 150000.00, CURDATE() - INTERVAL 3 DAY, 'Stok pembersih bulanan tempat mainan'),
('Pembayaran Listrik & WiFi', 'Utilitas', 650000.00, CURDATE() - INTERVAL 5 DAY, 'Tagihan bulanan arena playground');
