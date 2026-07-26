-- Migration 001: Add status column to point_redemptions table

USE `kinderfun_db`;

ALTER TABLE `point_redemptions` 
ADD COLUMN IF NOT EXISTS `status` ENUM('pending', 'picked_up') DEFAULT 'picked_up' AFTER `qty`;
