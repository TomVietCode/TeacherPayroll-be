import { z } from 'zod';

export const createDepartmentSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name cannot be empty')
    .max(100, 'Full name cannot exceed 100 characters'),
  shortName: z.string()
    .min(1, 'Short name cannot be empty')
    .max(50, 'Short name cannot exceed 50 characters'),
  description: z.string().optional()
});

export const updateDepartmentSchema = createDepartmentSchema.partial(); 