-- AlterTable
ALTER TABLE `maintenance` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `maintenance_isDeleted_idx` ON `maintenance`(`isDeleted`);
