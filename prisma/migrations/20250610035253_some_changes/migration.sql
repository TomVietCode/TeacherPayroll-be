-- AlterTable
ALTER TABLE `CourseClass` MODIFY `code` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `Subject` MODIFY `code` VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE `HourlyRate` (
    `id` VARCHAR(36) NOT NULL,
    `academicYear` VARCHAR(20) NOT NULL,
    `ratePerHour` DOUBLE NOT NULL,
    `establishedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HourlyRate_academicYear_key`(`academicYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherCoefficient` (
    `id` VARCHAR(36) NOT NULL,
    `academicYear` VARCHAR(20) NOT NULL,
    `degreeId` VARCHAR(36) NOT NULL,
    `coefficient` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeacherCoefficient_academicYear_degreeId_key`(`academicYear`, `degreeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassCoefficient` (
    `id` VARCHAR(36) NOT NULL,
    `academicYear` VARCHAR(20) NOT NULL,
    `standardStudentRange` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ClassCoefficient_academicYear_key`(`academicYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeacherCoefficient` ADD CONSTRAINT `TeacherCoefficient_degreeId_fkey` FOREIGN KEY (`degreeId`) REFERENCES `Degree`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
