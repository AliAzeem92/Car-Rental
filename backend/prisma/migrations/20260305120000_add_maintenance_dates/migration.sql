-- AlterTable
ALTER TABLE `vehicle` 
ADD COLUMN `nextServiceDate` DATETIME(3) NULL,
ADD COLUMN `insuranceExpiryDate` DATETIME(3) NULL;