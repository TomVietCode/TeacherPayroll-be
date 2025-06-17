import { z } from 'zod';

// User roles enum for validation
const UserRole = z.enum(['ADMIN', 'FACULTY_MANAGER', 'ACCOUNTANT', 'TEACHER']);

// Login validation schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .max(50, 'Tên đăng nhập không được quá 50 ký tự'),
  
  password: z.string()
    .min(1, 'Mật khẩu không được để trống'),
  
  role: UserRole.refine(val => val, {
    message: 'Vai trò không hợp lệ'
  })
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Mật khẩu hiện tại không được để trống'),
  
  newPassword: z.string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .max(255, 'Mật khẩu mới không được quá 255 ký tự')
});

// Create user validation schema (for admin use)
export const createUserSchema = z.object({
  username: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .max(50, 'Tên đăng nhập không được quá 50 ký tự')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang'),
  
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(255, 'Mật khẩu không được quá 255 ký tự'),
  
  role: UserRole,
  
  teacherId: z.string().uuid('Teacher ID phải là UUID hợp lệ').optional(),
  
  isActive: z.boolean().default(true)
});

// Update user validation schema
export const updateUserSchema = z.object({
  username: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .max(50, 'Tên đăng nhập không được quá 50 ký tự')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang')
    .optional(),
  
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(255, 'Mật khẩu không được quá 255 ký tự')
    .optional(),
  
  role: UserRole.optional(),
  
  teacherId: z.string().uuid('Teacher ID phải là UUID hợp lệ').optional(),
  
  isActive: z.boolean().optional()
}); 