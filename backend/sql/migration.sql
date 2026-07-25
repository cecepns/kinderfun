-- Migration to add status column to point_redemptions table

ALTER TABLE `point_redemptions` 
ADD COLUMN `status` ENUM('pending', 'picked_up') DEFAULT 'picked_up' AFTER `qty`;
