import { z } from 'zod';

// Schema for creating hourly rate
export const createHourlyRateSchema = z.object({
  academicYear: z.string()
    .min(1, 'Vui lòng chọn năm học')
    .regex(/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY'),
  ratePerHour: z.number()
    .positive('Số tiền theo tiết phải là số dương')
    .min(1000, 'Số tiền theo tiết phải ít nhất 1,000 VNĐ')
    .max(1000000, 'Số tiền theo tiết không được quá 1,000,000 VNĐ')
});

// Schema for updating hourly rate
export const updateHourlyRateSchema = z.object({
  ratePerHour: z.number()
    .positive('Số tiền theo tiết phải là số dương')
    .min(1000, 'Số tiền theo tiết phải ít nhất 1,000 VNĐ')
    .max(1000000, 'Số tiền theo tiết không được quá 1,000,000 VNĐ')
    .optional()
}); 