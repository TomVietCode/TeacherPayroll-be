import { z } from 'zod';

const allowedPeriods = [30, 45, 60, 90, 135];

export const createSubjectSchema = z.object({
  name: z.string()
    .min(1, 'Subject name cannot be empty')
    .max(200, 'Subject name cannot exceed 200 characters'),
  credits: z.number()
    .positive('Credits must be a positive number')
    .int('Credits must be an integer'),
  coefficient: z.number()
    .positive('Coefficient must be a positive number'),
  totalPeriods: z.number()
    .int('Total periods must be an integer')
    .refine((val) => allowedPeriods.includes(val), {
      message: 'Total periods must be one of: 30, 45, 60, 90, 135'
    }),
  departmentId: z.string()
    .min(1, 'Department is required')
    .max(36, 'Invalid department ID')
});

export const updateSubjectSchema = createSubjectSchema.partial(); 