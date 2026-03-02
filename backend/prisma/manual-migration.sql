-- Step 1: Create User table
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `firstName` VARCHAR(191) NULL,
  `lastName` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `licenseNumber` VARCHAR(191) NULL,
  `licenseExpiryDate` DATETIME(3) NULL,
  `idCardUrl` VARCHAR(191) NULL,
  `licenseUrl` VARCHAR(191) NULL,
  `isBlacklisted` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `user_email_key`(`email`),
  UNIQUE INDEX `user_licenseNumber_key`(`licenseNumber`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Migrate admin data
INSERT INTO `user` (`email`, `password`, `role`, `createdAt`)
SELECT `email`, `password`, 'ADMIN', `createdAt`
FROM `admin`;

-- Step 3: Migrate customer data
INSERT INTO `user` (`email`, `password`, `role`, `firstName`, `lastName`, `phone`, `address`, `licenseNumber`, `licenseExpiryDate`, `idCardUrl`, `licenseUrl`, `isBlacklisted`, `createdAt`)
SELECT `email`, COALESCE(`password`, ''), 'CUSTOMER', `firstName`, `lastName`, `phone`, `address`, `licenseNumber`, `licenseExpiryDate`, `idCardUrl`, `licenseUrl`, `isBlacklisted`, `createdAt`
FROM `customer`;

-- Step 4: Add userId column to reservation
ALTER TABLE `reservation` ADD COLUMN `userId` INT NULL;

-- Step 5: Populate userId from customerId
UPDATE `reservation` r
INNER JOIN `customer` c ON r.customerId = c.id
INNER JOIN `user` u ON c.email = u.email
SET r.userId = u.id;

-- Step 6: Make userId NOT NULL
ALTER TABLE `reservation` MODIFY `userId` INT NOT NULL;

-- Step 7: Drop old foreign key and column
ALTER TABLE `reservation` DROP FOREIGN KEY `reservation_customerId_fkey`;
ALTER TABLE `reservation` DROP COLUMN `customerId`;

-- Step 8: Add new foreign key
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Drop old tables
DROP TABLE `admin`;
DROP TABLE `customer`;
