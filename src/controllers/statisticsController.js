import { PrismaClient } from '@prisma/client';
import { calculateAge } from '../helpers/calculate.js';
import {
  exportDepartmentStatisticsToExcel,
  exportDegreeStatisticsToExcel,
  exportAgeStatisticsToExcel,
  exportSummaryStatisticsToExcel
} from '../helpers/excelExport.js';
import { 
  calculateTeachersByDepartment, 
  calculateTeachersByDegree, 
  calculateTeachersByAge 
} from '../helpers/calculateStatistics.js';

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
    // Get all departments
    const departments = await prisma.department.findMany({
      orderBy: { fullName: 'asc' }
    });
    
    // Get all teachers with department information
    const teachers = await prisma.teacher.findMany({
      include: {
        department: true
      }
    });
    
    // Calculate statistics
    const stats = calculateTeachersByDepartment(teachers, departments);
    
    res.json({ 
      data: stats,
      total: teachers.length
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-department/export
export const exportTeachersByDepartment = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-degree
export const getTeachersByDegree = async (req, res, next) => {
  try {
    // Get all degrees
    const degrees = await prisma.degree.findMany({
      orderBy: { fullName: 'asc' }
    });
    
    // Get all teachers with degree information
    const teachers = await prisma.teacher.findMany({
      include: {
        degree: true
      }
    });
    
    // Calculate statistics
    const stats = calculateTeachersByDegree(teachers, degrees);
    
    res.json({ 
      data: stats,
      total: teachers.length
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-degree/export
export const exportTeachersByDegree = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-age
export const getTeachersByAge = async (req, res, next) => {
  try {
    // Get all teachers
    const teachers = await prisma.teacher.findMany();
    
    // Calculate statistics
    const stats = calculateTeachersByAge(teachers);
    
    res.json({ 
      data: stats,
      total: teachers.length
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/by-age/export
export const exportTeachersByAge = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/summary
export const getStatisticsSummary = async (req, res, next) => {
  try {
    // Get counts
    const teacherCount = await prisma.teacher.count();
    const departmentCount = await prisma.department.count();
    const degreeCount = await prisma.degree.count();
    
    // Get department stats
    const departmentStats = await prisma.department.findMany({
      include: {
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Get degree stats
    const degreeStats = await prisma.degree.findMany({
      include: {
        _count: {
          select: { teachers: true }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });
    
    // Get teachers for age stats
    const teachers = await prisma.teacher.findMany();
    const ageStats = calculateTeachersByAge(teachers);
    
    res.json({
      data: {
        counts: {
          teachers: teacherCount,
          departments: departmentCount,
          degrees: degreeCount
        },
        byDepartment: departmentStats.map(dept => ({
          id: dept.id,
          fullName: dept.fullName,
          shortName: dept.shortName,
          count: dept._count.teachers
        })),
        byDegree: degreeStats.map(degree => ({
          id: degree.id,
          fullName: degree.fullName,
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
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/course-classes/:academicYear
export const getCourseClassStatistics = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    
    // Get all semesters in the selected academic year
    const semesters = await prisma.semester.findMany({
      where: {
        academicYear: academicYear
      },
      select: {
        id: true
      }
    });

    const semesterIds = semesters.map(semester => semester.id);
    
    // Get all subjects with their course classes in these semesters
    const subjects = await prisma.subject.findMany({
      include: {
        courseClasses: {
          where: {
            semesterId: {
              in: semesterIds
            }
          },
          select: {
            id: true,
            code: true,
            name: true,
            studentCount: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format the result
    const statistics = subjects.map(subject => {
      const classCount = subject.courseClasses.length;
      const totalStudents = subject.courseClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
      
      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        classCount,
        totalStudents
      };
    });
    
    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

// [GET] /api/statistics/course-classes/:academicYear/export
export const exportCourseClassStatistics = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    
    // Get all semesters in the selected academic year
    const semesters = await prisma.semester.findMany({
      where: {
        academicYear: academicYear
      },
      select: {
        id: true
      }
    });

    const semesterIds = semesters.map(semester => semester.id);
    
    // Get all subjects with their course classes in these semesters
    const subjects = await prisma.subject.findMany({
      include: {
        courseClasses: {
          where: {
            semesterId: {
              in: semesterIds
            }
          },
          select: {
            id: true,
            code: true,
            name: true,
            studentCount: true
          }
        },
        department: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format the result for Excel export
    const statistics = subjects.map(subject => {
      const classCount = subject.courseClasses.length;
      const totalStudents = subject.courseClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
      
      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        departmentName: subject.department?.fullName || 'Chưa phân khoa',
        classCount,
        totalStudents
      };
    });
    
    // Generate Excel file using excelExport helper
    const { exportCourseClassStatisticsToExcel } = await import('../helpers/excelExport.js');
    const buffer = await exportCourseClassStatisticsToExcel(statistics, academicYear);
    
    // Set response headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="thong-ke-lop-hoc-phan-${academicYear}.xlsx"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}; 