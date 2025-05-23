-- CreateTable
CREATE TABLE `Semester` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `academicYear` VARCHAR(20) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Semester_academicYear_name_key`(`academicYear`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
