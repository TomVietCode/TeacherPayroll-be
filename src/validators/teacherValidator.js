import { z } from 'zod';

export const createTeacherSchema = z.object({
  code: z.string()
    .max(20, 'Teacher code cannot exceed 20 characters')
    .optional(),
  fullName: z.string()
    .min(1, 'Full name cannot be empty')
    .max(100, 'Full name cannot exceed 100 characters'),
  dateOfBirth: z.string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: 'Invalid date format'
    })
    .refine((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      return inputDate <= today;
    }, {
      message: 'Date of birth cannot be in the future'
    }),
  phone: z.string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .refine((value) => /^\d*$/.test(value), {
      message: 'Phone number should only contain digits'
    })
    .optional()
    .nullable(),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters')
    .optional()
    .nullable(),
  departmentId: z.string()
    .min(1, 'Department is required'),
  degreeId: z.string()
    .min(1, 'Degree is required')
});

export const updateTeacherSchema = createTeacherSchema.partial(); 