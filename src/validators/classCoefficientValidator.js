import { z } from 'zod';

// Valid student ranges for class coefficients
const VALID_STUDENT_RANGES = [
  '<20', '20-29', '30-39', '40-49', '50-59', 
  '60-69', '70-79', '80-89', '90-99', '100+'
];

// Schema for creating class coefficient
export const createClassCoefficientSchema = z.object({
  academicYear: z.string()
    .min(1, 'Vui lòng chọn năm học')
    .regex(/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY'),
  standardStudentRange: z.string()
    .refine(val => VALID_STUDENT_RANGES.includes(val), 
      'Vui lòng chọn khoảng số sinh viên hợp lệ')
});

// Schema for updating class coefficient
export const updateClassCoefficientSchema = z.object({
  standardStudentRange: z.string()
    .refine(val => VALID_STUDENT_RANGES.includes(val), 
      'Vui lòng chọn khoảng số sinh viên hợp lệ')
    .optional()
});

export { VALID_STUDENT_RANGES }; 