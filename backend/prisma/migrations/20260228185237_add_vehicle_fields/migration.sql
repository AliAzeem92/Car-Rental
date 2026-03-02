-- AlterTable
ALTER TABLE `maintenance` ADD COLUMN `dueMileage` INTEGER NULL;

-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `features` TEXT NULL,
    ADD COLUMN `fuelType` VARCHAR(191) NULL,
    ADD COLUMN `seats` INTEGER NULL,
    ADD COLUMN `transmission` VARCHAR(191) NULL,
    ADD COLUMN `year` INTEGER NULL;
