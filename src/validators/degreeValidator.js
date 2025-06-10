import { z } from 'zod';

export const createDegreeSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name cannot be empty')
    .max(100, 'Full name cannot exceed 100 characters'),
  shortName: z.string()
    .min(1, 'Short name cannot be empty')
    .max(5, 'Short name cannot exceed 5 characters'),
  coefficient: z.number()
    .min(0.1, 'Coefficient must be at least 0.1')
    .max(10.0, 'Coefficient cannot exceed 10.0')
});

export const updateDegreeSchema = createDegreeSchema.partial(); 