/*
  Warnings:

  - You are about to drop the column `name` on the `Semester` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[academicYear,termNumber,isSupplementary]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `termNumber` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Semester_academicYear_name_key` ON `Semester`;

-- AlterTable
ALTER TABLE `Semester` DROP COLUMN `name`,
    ADD COLUMN `isSupplementary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `termNumber` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Semester_academicYear_termNumber_isSupplementary_key` ON `Semester`(`academicYear`, `termNumber`, `isSupplementary`);
