/*
  Warnings:

  - A unique constraint covering the columns `[code,semesterId]` on the table `CourseClass` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `CourseClass_code_key` ON `CourseClass`;

-- CreateIndex
CREATE UNIQUE INDEX `CourseClass_code_semesterId_key` ON `CourseClass`(`code`, `semesterId`);
