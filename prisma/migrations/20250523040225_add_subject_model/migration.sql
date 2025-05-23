-- CreateTable
CREATE TABLE `Subject` (
    `id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `credits` INTEGER NOT NULL,
    `coefficient` DOUBLE NOT NULL,
    `totalPeriods` INTEGER NOT NULL,
    `departmentId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subject_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
