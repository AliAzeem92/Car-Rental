-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `paymentStatus` ENUM('PAID', 'UNPAID', 'PARTIAL') NOT NULL DEFAULT 'UNPAID';
