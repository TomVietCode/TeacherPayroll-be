import { z } from 'zod';

// Schema for creating teacher coefficient
export const createTeacherCoefficientSchema = z.object({
  academicYear: z.string()
    .min(1, 'Vui lòng chọn năm học')
    .regex(/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY'),
  degreeId: z.string()
    .min(1, 'Vui lòng chọn bằng cấp'),
  coefficient: z.number()
    .positive('Hệ số phải là số dương')
    .min(0.1, 'Hệ số phải ít nhất 0.1')
    .max(5.0, 'Hệ số không được quá 5.0')
});

// Schema for updating teacher coefficient
export const updateTeacherCoefficientSchema = z.object({
  coefficient: z.number()
    .positive('Hệ số phải là số dương')
    .min(0.1, 'Hệ số phải ít nhất 0.1')
    .max(5.0, 'Hệ số không được quá 5.0')
    .optional()
});

// Schema for batch updating coefficients
export const batchUpdateTeacherCoefficientsSchema = z.object({
  academicYear: z.string()
    .min(1, 'Vui lòng chọn năm học')
    .regex(/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY'),
  coefficients: z.array(z.object({
    degreeId: z.string().min(1, 'Vui lòng chọn bằng cấp'),
    coefficient: z.number()
      .positive('Hệ số phải là số dương')
      .min(0.1, 'Hệ số phải ít nhất 0.1')
      .max(5.0, 'Hệ số không được quá 5.0')
  })).min(1, 'Phải có ít nhất một hệ số')
}); 