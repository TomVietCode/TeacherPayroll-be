import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../validators/authValidator.js';

const prisma = new PrismaClient();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// [POST] /api/auth/login
export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password, role } = validatedData;

    // Find user by username and role
    const user = await prisma.user.findFirst({
      where: {
        username,
        role,
        isActive: true
      },
      include: {
        teacher: {
          select: {
            id: true,
            code: true,
            fullName: true,
            dateOfBirth: true,
            phone: true,
            email: true,
            department: {
              select: {
                id: true,
                fullName: true,
                shortName: true
              }
            },
            degree: {
              select: {
                id: true,
                fullName: true,
                shortName: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập, mật khẩu hoặc vai trò không đúng'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập, mật khẩu hoặc vai trò không đúng'
      });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    });

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
        teacher: user.teacher
      },
      token,
      expiresIn: JWT_EXPIRES_IN
    };

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: responseData
    });

  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: error.errors
      });
    }
    next(error);
  }
};

// [POST] /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    // For JWT, logout is typically handled on client-side by removing token
    // But we can blacklist tokens if needed (requires additional setup)
    
    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// [GET] /api/auth/me - Get current user info
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        teacher: {
          select: {
            id: true,
            code: true,
            fullName: true,
            dateOfBirth: true,
            phone: true,
            email: true,
            department: {
              select: {
                id: true,
                fullName: true,
                shortName: true
              }
            },
            degree: {
              select: {
                id: true,
                fullName: true,
                shortName: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

// [PATCH] /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
}; 