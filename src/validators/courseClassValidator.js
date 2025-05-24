import { z } from 'zod';

export const createCourseClassSchema = z.object({
  subjectId: z.string()
    .min(1, 'Subject is required'),
  semesterId: z.string()
    .min(1, 'Semester is required'),
  numberOfClasses: z.number()
    .int('Number of classes must be an integer')
    .min(1, 'Number of classes must be at least 1')
    .max(10, 'Number of classes cannot exceed 10')
});

export const updateCourseClassSchema = z.object({
  studentCount: z.number()
    .int('Student count must be an integer')
    .min(0, 'Student count must be non-negative')
    .max(1000, 'Student count cannot exceed 1000')
}); 