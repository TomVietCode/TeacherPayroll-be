import { PrismaClient } from '@prisma/client';
import { calculateAge } from '../helpers/calculate.js';
import {
  exportDepartmentStatisticsToExcel,
  exportDegreeStatisticsToExcel,
  exportAgeStatisticsToExcel,
  exportSummaryStatisticsToExcel
} from '../helpers/excelExport.js';

const prisma = new PrismaClient();

// Group teachers by age ranges
const groupTeachersByAgeRange = (teachers) => {
  const ageGroups = {
    'Dưới 30': 0,
    '30-40': 0,
    '41-50': 0,
    '51-60': 0,
    'Trên 60': 0
  };
  
  teachers.forEach(teacher => {
    const age = calculateAge(teacher.dateOfBirth);
    
    if (age < 30) {
      ageGroups['Dưới 30']++;
    } else if (age <= 40) {
      ageGroups['30-40']++;
    } else if (age <= 50) {
      ageGroups['41-50']++;
    } else if (age <= 60) {
      ageGroups['51-60']++;
    } else {
      ageGroups['Trên 60']++;
    }
  });
  
  return Object.entries(ageGroups).map(([label, count]) => ({
    label,
    count
  }));
};

// [GET] /api/statistics/by-department
export const getTeachersByDepartment = async (req, res, next) => {
  try {
    // Check if there are any teachers
    const teacherCount = await prisma.teacher.count();
    
    if (teacherCount === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Get all departments with their teacher count
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Format the data for frontend
    const statistics = departments.map(dept => ({
      id: dept.id,
      label: dept.fullName,
      shortName: dept.shortName,
      count: dept._count.teachers
    }));
    
    res.json({ 
      data: statistics,
      total: teacherCount
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-department/export
export const exportTeachersByDepartment = async (req, res, next) => {
  try {
    // Check if there are any teachers
    const teacherCount = await prisma.teacher.count();
    
    if (teacherCount === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Get all departments with their teacher count
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Format the data for Excel
    const statistics = departments.map(dept => ({
      id: dept.id,
      label: dept.fullName,
      shortName: dept.shortName,
      count: dept._count.teachers
    }));
    
    // Generate Excel file
    const buffer = await exportDepartmentStatisticsToExcel(statistics, teacherCount);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=thong-ke-theo-khoa.xlsx');
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-degree
export const getTeachersByDegree = async (req, res, next) => {
  try {
    // Check if there are any teachers
    const teacherCount = await prisma.teacher.count();
    
    if (teacherCount === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Get all degrees with their teacher count
    const degrees = await prisma.degree.findMany({
      include: {
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Format the data for frontend
    const statistics = degrees.map(degree => ({
      id: degree.id,
      label: degree.fullName,
      shortName: degree.shortName,
      count: degree._count.teachers
    }));
    
    res.json({ 
      data: statistics,
      total: teacherCount
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-degree/export
export const exportTeachersByDegree = async (req, res, next) => {
  try {
    // Check if there are any teachers
    const teacherCount = await prisma.teacher.count();
    
    if (teacherCount === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Get all degrees with their teacher count
    const degrees = await prisma.degree.findMany({
      include: {
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Format the data for Excel
    const statistics = degrees.map(degree => ({
      id: degree.id,
      label: degree.fullName,
      shortName: degree.shortName,
      count: degree._count.teachers
    }));
    
    // Generate Excel file
    const buffer = await exportDegreeStatisticsToExcel(statistics, teacherCount);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=thong-ke-theo-bang-cap.xlsx');
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-age
export const getTeachersByAge = async (req, res, next) => {
  try {
    // Get all teachers with their date of birth
    const teachers = await prisma.teacher.findMany({
      select: {
        dateOfBirth: true
      }
    });
    
    if (teachers.length === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Group teachers by age range
    const statistics = groupTeachersByAgeRange(teachers);
    
    res.json({ 
      data: statistics,
      total: teachers.length
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-age/export
export const exportTeachersByAge = async (req, res, next) => {
  try {
    // Get all teachers with their date of birth
    const teachers = await prisma.teacher.findMany({
      select: {
        dateOfBirth: true
      }
    });
    
    if (teachers.length === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Group teachers by age range
    const statistics = groupTeachersByAgeRange(teachers);
    
    // Generate Excel file
    const buffer = await exportAgeStatisticsToExcel(statistics, teachers.length);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=thong-ke-theo-do-tuoi.xlsx');
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/summary
export const getStatisticsSummary = async (req, res, next) => {
  try {
    // Get counts for teachers, departments, and degrees
    const [teacherCount, departmentCount, degreeCount] = await Promise.all([
      prisma.teacher.count(),
      prisma.department.count(),
      prisma.degree.count()
    ]);
    
    if (teacherCount === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Get statistics on teachers by department
    const departmentStats = await prisma.department.findMany({
      select: {
        id: true,
        fullName: true,
        shortName: true,
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Get statistics on teachers by degree
    const degreeStats = await prisma.degree.findMany({
      select: {
        id: true,
        fullName: true,
        shortName: true,
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Get all teachers for age stats
    const teachers = await prisma.teacher.findMany({
      select: {
        dateOfBirth: true
      }
    });
    
    const ageStats = groupTeachersByAgeRange(teachers);
    
    res.json({
      data: {
        counts: {
          teachers: teacherCount,
          departments: departmentCount,
          degrees: degreeCount
        },
        byDepartment: departmentStats.map(dept => ({
          id: dept.id,
          label: dept.fullName,
          shortName: dept.shortName,
          count: dept._count.teachers
        })),
        byDegree: degreeStats.map(degree => ({
          id: degree.id,
          label: degree.fullName,
          shortName: degree.shortName,
          count: degree._count.teachers
        })),
        byAge: ageStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/summary/export
export const exportStatisticsSummary = async (req, res, next) => {
  try {
    // Get counts for teachers, departments, and degrees
    const [teacherCount, departmentCount, degreeCount] = await Promise.all([
      prisma.teacher.count(),
      prisma.department.count(),
      prisma.degree.count()
    ]);
    
    if (teacherCount === 0) {
      return res.status(404).json({ 
        message: 'Không có dữ liệu thống kê' 
      });
    }
    
    // Get statistics on teachers by department
    const departmentStats = await prisma.department.findMany({
      select: {
        id: true,
        fullName: true,
        shortName: true,
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Get statistics on teachers by degree
    const degreeStats = await prisma.degree.findMany({
      select: {
        id: true,
        fullName: true,
        shortName: true,
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Get all teachers for age stats
    const teachers = await prisma.teacher.findMany({
      select: {
        dateOfBirth: true
      }
    });
    
    const ageStats = groupTeachersByAgeRange(teachers);
    
    const data = {
      counts: {
        teachers: teacherCount,
        departments: departmentCount,
        degrees: degreeCount
      },
      byDepartment: departmentStats.map(dept => ({
        id: dept.id,
        label: dept.fullName,
        shortName: dept.shortName,
        count: dept._count.teachers
      })),
      byDegree: degreeStats.map(degree => ({
        id: degree.id,
        label: degree.fullName,
        shortName: degree.shortName,
        count: degree._count.teachers
      })),
      byAge: ageStats
    };
    
    // Generate Excel file
    const buffer = await exportSummaryStatisticsToExcel(data);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=thong-ke-tong-hop.xlsx');
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}; 