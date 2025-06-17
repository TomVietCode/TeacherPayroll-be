/*
  Warnings:

  - You are about to drop the column `notes` on the `TeacherAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `workload` on the `TeacherAssignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `TeacherAssignment` DROP COLUMN `notes`,
    DROP COLUMN `workload`;
