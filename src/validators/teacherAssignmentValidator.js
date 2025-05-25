import { z } from 'zod';

// Create teacher assignment validator
export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
  courseClassId: z.string().uuid('Course class ID must be a valid UUID'),
});

// Update teacher assignment validator
export const updateTeacherAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID').optional(),
  courseClassId: z.string().uuid('Course class ID must be a valid UUID').optional(),
});

// Bulk assignment validator
export const bulkAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
  courseClassIds: z.array(z.string().uuid('Course class ID must be a valid UUID'))
    .min(1, 'At least one course class must be selected')
    .max(50, 'Cannot assign more than 50 classes at once'),
});

// Assignment query validator
export const assignmentQuerySchema = z.object({
  teacherId: z.string().uuid().optional(),
  courseClassId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  page: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, 'Page must be a positive number'),
  limit: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num <= 100;
  }, 'Limit must be a positive number and not exceed 100'),
}); 