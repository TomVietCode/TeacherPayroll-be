import { PrismaClient } from '@prisma/client';
import { calculateClassCoefficient } from './classCoefficientController.js';

const prisma = new PrismaClient();

// [POST] /api/payroll/calculate
export const calculatePayroll = async (req, res, next) => {
  try {
    const { academicYear, semesterId, teacherId } = req.body;
    
    if (!academicYear || !semesterId || !teacherId) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp đầy đủ thông tin: năm học, kỳ học và giáo viên' 
      });
    }
    
    // Get teacher with degree information
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        degree: {
          select: {
            id: true,
            fullName: true,
            shortName: true
          }
        }
      }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Giáo viên không tìm thấy' });
    }
    
    // Get semester information
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId }
    });
    
    if (!semester) {
      return res.status(404).json({ message: 'Kỳ học không tìm thấy' });
    }
    
    // Verify academic year matches semester
    if (semester.academicYear !== academicYear) {
      return res.status(400).json({ message: 'Kỳ học không thuộc năm học đã chọn' });
    }
    
    // Get hourly rate for the academic year
    const hourlyRate = await prisma.hourlyRate.findUnique({
      where: { academicYear }
    });
    
    if (!hourlyRate) {
      return res.status(404).json({ 
        message: 'Vui lòng thiết lập định mức tiền theo tiết cho năm học này trước' 
      });
    }
    
    // Get teacher coefficient for the academic year and degree
    const teacherCoefficient = await prisma.teacherCoefficient.findUnique({
      where: {
        academicYear_degreeId: {
          academicYear,
          degreeId: teacher.degreeId
        }
      }
    });
    
    // Use default coefficient of 1.0 if not found
    const teacherCoefficientValue = teacherCoefficient ? teacherCoefficient.coefficient : 1.0;
    
    // Get class coefficient setting for the academic year
    const classCoefficient = await prisma.classCoefficient.findUnique({
      where: { academicYear }
    });
    
    if (!classCoefficient) {
      return res.status(404).json({ 
        message: 'Vui lòng thiết lập hệ số lớp cho năm học này trước' 
      });
    }
    
    // Get teacher assignments for this semester
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId,
        courseClass: {
          semesterId
        }
      },
      include: {
        courseClass: {
          include: {
            subject: {
              select: {
                id: true,
                code: true,
                name: true,
                credits: true,
                coefficient: true,
                totalPeriods: true
              }
            }
          }
        }
      }
    });
    
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Không có dữ liệu để tính tiền dạy' });
    }
    
    // Calculate payroll for each class
    const classPayrolls = assignments.map(assignment => {
      const courseClass = assignment.courseClass;
      const subject = courseClass.subject;
      
      // Calculate class coefficient based on student count
      const dynamicClassCoeff = calculateClassCoefficient(
        courseClass.studentCount, 
        classCoefficient.standardStudentRange
      );
      
      // Calculate converted periods
      const convertedPeriods = subject.totalPeriods * (subject.coefficient + dynamicClassCoeff);
      
      // Calculate total salary for this class
      const classSalary = convertedPeriods * teacherCoefficientValue * hourlyRate.ratePerHour;
      
      return {
        courseClassId: courseClass.id,
        courseClassCode: courseClass.code,
        courseClassName: courseClass.name,
        subjectName: subject.name,
        totalPeriods: subject.totalPeriods,
        studentCount: courseClass.studentCount,
        subjectCoefficient: subject.coefficient,
        classCoefficient: dynamicClassCoeff,
        convertedPeriods: Math.round(convertedPeriods * 100) / 100, // Round to 2 decimal places
        classSalary: Math.round(classSalary)
      };
    });
    
    // Calculate total salary
    const totalSalary = classPayrolls.reduce((sum, cls) => sum + cls.classSalary, 0);
    
    // Prepare response
    const result = {
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        code: teacher.code,
        degree: teacher.degree
      },
      semester: {
        id: semester.id,
        termNumber: semester.termNumber,
        isSupplementary: semester.isSupplementary,
        academicYear: semester.academicYear
      },
      coefficients: {
        teacherCoefficient: teacherCoefficientValue,
        hourlyRate: hourlyRate.ratePerHour,
        standardStudentRange: classCoefficient.standardStudentRange
      },
      classes: classPayrolls,
      totalSalary: Math.round(totalSalary),
      calculatedAt: new Date()
    };
    
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/payroll/academic-years
export const getAcademicYearsWithPayrollData = async (req, res, next) => {
  try {
    // Temporarily return all academic years from semesters
    // Later will check for payroll data requirements after DB migration
    const academicYears = await prisma.semester.findMany({
      select: { academicYear: true },
      distinct: ['academicYear'],
      orderBy: { academicYear: 'asc' }
    });
    
    const yearsList = academicYears.map(item => item.academicYear);
    
    res.json({ data: yearsList });
  } catch (error) {
    next(error);
  }
}; 