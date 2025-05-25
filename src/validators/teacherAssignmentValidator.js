import { z } from 'zod';

// Create teacher assignment validator
export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
  courseClassId: z.string().uuid('Course class ID must be a valid UUID'),
  assignedDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }, 'Assigned date must be a valid date and not in the future'),
  workload: z.number().positive('Workload must be a positive number').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Update teacher assignment validator
export const updateTeacherAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID').optional(),
  courseClassId: z.string().uuid('Course class ID must be a valid UUID').optional(),
  assignedDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }, 'Assigned date must be a valid date and not in the future'),
  status: z.enum(['active', 'inactive', 'completed'], 'Status must be active, inactive, or completed').optional(),
  workload: z.number().positive('Workload must be a positive number').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Bulk assignment validator for quick assignment
export const bulkAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
  courseClassIds: z.array(z.string().uuid('Course class ID must be a valid UUID'))
    .min(1, 'At least one course class must be selected')
    .max(50, 'Cannot assign more than 50 classes at once'),
  assignedDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }, 'Assigned date must be a valid date and not in the future'),
  workload: z.number().positive('Workload must be a positive number').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Quick assignment by filters validator
export const quickAssignmentSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
  semesterId: z.string().uuid('Semester ID must be a valid UUID').optional(),
  subjectId: z.string().uuid('Subject ID must be a valid UUID').optional(),
  departmentId: z.string().uuid('Department ID must be a valid UUID').optional(),
  unassignedOnly: z.boolean().default(true),
  maxClasses: z.number().int().positive().max(100).default(20),
  assignedDate: z.string().optional().refine((date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }, 'Assigned date must be a valid date and not in the future'),
  workload: z.number().positive('Workload must be a positive number').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Assignment query validator
export const assignmentQuerySchema = z.object({
  teacherId: z.string().uuid().optional(),
  courseClassId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'completed']).optional(),
  assignedDateFrom: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(new Date(date).getTime());
  }, 'From date must be a valid date'),
  assignedDateTo: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(new Date(date).getTime());
  }, 'To date must be a valid date'),
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