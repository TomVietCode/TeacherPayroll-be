-- AlterTable
ALTER TABLE `CourseClass` ADD COLUMN `maxStudents` INTEGER NOT NULL DEFAULT 40;

-- AlterTable
ALTER TABLE `Degree` ADD COLUMN `coefficient` DOUBLE NOT NULL DEFAULT 1.0;
