-- AlterTable
ALTER TABLE `vehicle` 
ADD COLUMN `currentMileage` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `nextOilChangeMileage` INTEGER NULL,
DROP COLUMN `mileage`;

-- DropTable
DROP TABLE IF EXISTS `checkin`;
DROP TABLE IF EXISTS `checkout`;

-- CreateTable
CREATE TABLE `checkout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservationId` INTEGER NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `mileageOut` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,

    UNIQUE INDEX `checkout_reservationId_key`(`reservationId`),
    INDEX `checkout_vehicleId_idx`(`vehicleId`),
    INDEX `checkout_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservationId` INTEGER NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `mileageIn` INTEGER NOT NULL,
    `damageReport` VARCHAR(191) NULL,
    `extraCharges` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,

    UNIQUE INDEX `checkin_reservationId_key`(`reservationId`),
    INDEX `checkin_vehicleId_idx`(`vehicleId`),
    INDEX `checkin_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checkout` ADD CONSTRAINT `checkout_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout` ADD CONSTRAINT `checkout_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout` ADD CONSTRAINT `checkout_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkin` ADD CONSTRAINT `checkin_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkin` ADD CONSTRAINT `checkin_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkin` ADD CONSTRAINT `checkin_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;