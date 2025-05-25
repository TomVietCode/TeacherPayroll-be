-- CreateTable
CREATE TABLE `TeacherAssignment` (
    `id` VARCHAR(36) NOT NULL,
    `teacherId` VARCHAR(36) NOT NULL,
    `courseClassId` VARCHAR(36) NOT NULL,
    `assignedDate` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `workload` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TeacherAssignment_teacherId_idx`(`teacherId`),
    INDEX `TeacherAssignment_courseClassId_idx`(`courseClassId`),
    INDEX `TeacherAssignment_assignedDate_idx`(`assignedDate`),
    UNIQUE INDEX `TeacherAssignment_teacherId_courseClassId_key`(`teacherId`, `courseClassId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeacherAssignment` ADD CONSTRAINT `TeacherAssignment_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherAssignment` ADD CONSTRAINT `TeacherAssignment_courseClassId_fkey` FOREIGN KEY (`courseClassId`) REFERENCES `CourseClass`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
