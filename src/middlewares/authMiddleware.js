import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'xinchao123';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        teacherId: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user has required role(s)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user can access teacher data
export const requireTeacherAccess = (req, res, next) => {
  const { role, teacherId } = req.user;
  const requestedTeacherId = req.params.teacherId || req.body.teacherId;

  // Admin, Faculty Manager, and Accountant can access all teacher data
  if (['ADMIN', 'FACULTY_MANAGER', 'ACCOUNTANT'].includes(role)) {
    return next();
  }

  // Teachers can only access their own data
  if (role === 'TEACHER' && teacherId === requestedTeacherId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied to this teacher data'
  });
};

// Middleware to check if user can access department data
export const requireDepartmentAccess = async (req, res, next) => {
  try {
    const { role, teacherId } = req.user;
    const requestedDepartmentId = req.params.departmentId || req.body.departmentId;

    // Admin, Faculty Manager, and Accountant can access all department data
    if (['ADMIN', 'FACULTY_MANAGER', 'ACCOUNTANT'].includes(role)) {
      return next();
    }

    // Teachers can only access their own department data
    if (role === 'TEACHER' && teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { departmentId: true }
      });

      if (teacher && teacher.departmentId === requestedDepartmentId) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied to this department data'
    });
  } catch (error) {
    console.error('Department access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Access check failed'
    });
  }
};

// Helper function to get permission matrix
export const getPermissions = (role) => {
  const permissions = {
    ADMIN: {
      canManageUsers: true,
      canManageTeachers: true,
      canManageDepartments: true,
      canManageSubjects: true,
      canManageSemesters: true,
      canManageCourseClasses: true,
      canManageAssignments: true,
      canManageCoefficients: true,
      canCalculatePayroll: true,
      canViewAllReports: true,
      canExportReports: true
    },
    FACULTY_MANAGER: {
      canManageUsers: false,
      canManageTeachers: true,
      canManageDepartments: true,
      canManageSubjects: true,
      canManageSemesters: true,
      canManageCourseClasses: true,
      canManageAssignments: true,
      canManageCoefficients: false, // Only view
      canCalculatePayroll: false, // Only view
      canViewAllReports: true,
      canExportReports: true
    },
    ACCOUNTANT: {
      canManageUsers: false,
      canManageTeachers: false, // Only view
      canManageDepartments: false, // Only view
      canManageSubjects: false, // Only view
      canManageSemesters: false, // Only view
      canManageCourseClasses: false, // Only view
      canManageAssignments: false, // Only view
      canManageCoefficients: true,
      canCalculatePayroll: true,
      canViewAllReports: true,
      canExportReports: true
    },
    TEACHER: {
      canManageUsers: false,
      canManageTeachers: false, // Only own data
      canManageDepartments: false, // Only view
      canManageSubjects: false, // Only view
      canManageSemesters: false, // Only view
      canManageCourseClasses: false, // Only view
      canManageAssignments: false, // Only view own
      canManageCoefficients: false, // Only view
      canCalculatePayroll: false, // Only view own
      canViewAllReports: false, // Only personal
      canExportReports: false // Only personal
    }
  };

  return permissions[role] || {};
};

// Middleware to check specific permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userPermissions = getPermissions(req.user.role);
    
    if (!userPermissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission}`
      });
    }

    next();
  };
}; 