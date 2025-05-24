-- CreateTable
CREATE TABLE `CourseClass` (
    `id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(250) NOT NULL,
    `studentCount` INTEGER NOT NULL DEFAULT 0,
    `classNumber` INTEGER NOT NULL,
    `subjectId` VARCHAR(36) NOT NULL,
    `semesterId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CourseClass_code_key`(`code`),
    UNIQUE INDEX `CourseClass_subjectId_semesterId_classNumber_key`(`subjectId`, `semesterId`, `classNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CourseClass` ADD CONSTRAINT `CourseClass_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseClass` ADD CONSTRAINT `CourseClass_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
