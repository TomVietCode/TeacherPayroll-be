import { PrismaClient } from '@prisma/client';
import { calculateClassCoefficient } from './classCoefficientController.js';

const prisma = new PrismaClient();

// UC4.1: Báo cáo tiền dạy của giáo viên trong một năm
export const getTeacherYearlyPayrollReport = async (req, res, next) => {
  try {
    const { teacherId, academicYear } = req.params;
    
    // Get teacher information
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        degree: true,
        department: true
      }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Giáo viên không tìm thấy' });
    }
    
    // Get all semesters in the academic year
    const semesters = await prisma.semester.findMany({
      where: { academicYear },
      orderBy: [
        { termNumber: 'asc' },
        { isSupplementary: 'asc' }
      ]
    });
    
    if (semesters.length === 0) {
      return res.status(404).json({ message: 'Không có dữ liệu kỳ học cho năm học này' });
    }
    
    // Get hourly rate and teacher coefficient for the academic year
    const [hourlyRate, teacherCoefficient, classCoefficient] = await Promise.all([
      prisma.hourlyRate.findUnique({ where: { academicYear } }),
      prisma.teacherCoefficient.findUnique({
        where: {
          academicYear_degreeId: {
            academicYear,
            degreeId: teacher.degreeId
          }
        }
      }),
      prisma.classCoefficient.findUnique({ where: { academicYear } })
    ]);
    
    if (!hourlyRate) {
      return res.status(404).json({ message: 'Chưa thiết lập định mức tiền theo tiết cho năm học này' });
    }
    
    // Use default coefficient of 1.0 if not found
    const teacherCoefficientValue = teacherCoefficient ? teacherCoefficient.coefficient : 1.0;
    
    if (!classCoefficient) {
      return res.status(404).json({ message: 'Chưa thiết lập hệ số lớp cho năm học này' });
    }
    
    const semesterReports = [];
    let totalYearlyClasses = 0;
    let totalYearlyPeriods = 0;
    let totalYearlyConvertedPeriods = 0;
    let totalYearlySalary = 0;
    
    // Calculate for each semester
    for (const semester of semesters) {
      const assignments = await prisma.teacherAssignment.findMany({
        where: {
          teacherId,
          courseClass: {
            semesterId: semester.id
          }
        },
        include: {
          courseClass: {
            include: {
              subject: true
            }
          }
        }
      });
      
      let semesterClasses = assignments.length;
      let semesterPeriods = 0;
      let semesterConvertedPeriods = 0;
      let semesterSalary = 0;
      
      for (const assignment of assignments) {
        const courseClass = assignment.courseClass;
        const subject = courseClass.subject;
        
        // Calculate class coefficient
        const classCoeff = calculateClassCoefficient(
          courseClass.studentCount,
          classCoefficient.standardStudentRange
        );
        
        // Calculate converted periods
        const convertedPeriods = subject.totalPeriods * subject.coefficient * (1 + classCoeff);
        
        // Calculate class salary
        const classSalary = convertedPeriods * hourlyRate.ratePerHour * teacherCoefficientValue;
        
        semesterPeriods += subject.totalPeriods;
        semesterConvertedPeriods += convertedPeriods;
        semesterSalary += classSalary;
      }
      
      const semesterName = `Kỳ ${semester.termNumber}${semester.isSupplementary ? ' (Phụ)' : ''}`;
      
      semesterReports.push({
        semesterId: semester.id,
        semesterName,
        termNumber: semester.termNumber,
        isSupplementary: semester.isSupplementary,
        classCount: semesterClasses,
        totalPeriods: semesterPeriods,
        totalConvertedPeriods: Math.round(semesterConvertedPeriods * 10) / 10,
        totalSalary: Math.round(semesterSalary)
      });
      
      totalYearlyClasses += semesterClasses;
      totalYearlyPeriods += semesterPeriods;
      totalYearlyConvertedPeriods += semesterConvertedPeriods;
      totalYearlySalary += semesterSalary;
    }
    
    res.json({
      data: {
        teacher: {
          id: teacher.id,
          fullName: teacher.fullName,
          code: teacher.code,
          degree: teacher.degree,
          department: teacher.department
        },
        academicYear,
        coefficients: {
          teacherCoefficient: teacherCoefficientValue,
          hourlyRate: hourlyRate.ratePerHour,
          standardStudentRange: classCoefficient.standardStudentRange
        },
        semesters: semesterReports,
        summary: {
          totalClasses: totalYearlyClasses,
          totalPeriods: totalYearlyPeriods,
          totalConvertedPeriods: Math.round(totalYearlyConvertedPeriods * 10) / 10,
          totalSalary: Math.round(totalYearlySalary)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// UC4.2: Báo cáo tiền dạy của giáo viên một khoa
export const getDepartmentPayrollReport = async (req, res, next) => {
  try {
    const { departmentId, academicYear } = req.params;
    const { semesterId } = req.query; // Optional, if not provided, report for all semesters
    
    // Get department information
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Khoa không tìm thấy' });
    }
    
    // Get teachers in the department
    const teachers = await prisma.teacher.findMany({
      where: { departmentId },
      include: {
        degree: true
      },
      orderBy: { fullName: 'asc' }
    });

    if (teachers.length === 0) {
      return res.status(404).json({ message: 'Không có giáo viên nào trong khoa này' });
    }
    
    // Get rates and coefficients
    const [hourlyRate, classCoefficient] = await Promise.all([
      prisma.hourlyRate.findUnique({ where: { academicYear } }),
      prisma.classCoefficient.findUnique({ where: { academicYear } })
    ]);
    
    if (!hourlyRate || !classCoefficient) {
      return res.status(404).json({ message: 'Chưa thiết lập đầy đủ các hệ số cho năm học này' });
    }
    
    // Build semester filter
    const semesterFilter = semesterId ? { id: semesterId } : { academicYear };
    
    const teacherReports = [];
    let totalDepartmentClasses = 0;
    let totalDepartmentPeriods = 0;
    let totalDepartmentConvertedPeriods = 0;
    let totalDepartmentSalary = 0;
    
    for (const teacher of teachers) {
      // Get teacher coefficient
      const teacherCoefficient = await prisma.teacherCoefficient.findUnique({
        where: {
          academicYear_degreeId: {
            academicYear,
            degreeId: teacher.degreeId
          }
        }
      });
      
      let teacherClasses = 0;
      let teacherPeriods = 0;
      let teacherConvertedPeriods = 0;
      let teacherSalary = 0;
      
      // Use default coefficient of 1.0 if not found
      const teacherCoefficientValue = teacherCoefficient ? teacherCoefficient.coefficient : 1.0;
      
      // Get assignments for the teacher
      const assignments = await prisma.teacherAssignment.findMany({
        where: {
          teacherId: teacher.id,
          courseClass: {
            semester: semesterFilter
          }
        },
        include: {
          courseClass: {
            include: {
              subject: true,
              semester: true
            }
          }
        }
      });
      
      teacherClasses = assignments.length;
      
      for (const assignment of assignments) {
        const courseClass = assignment.courseClass;
        const subject = courseClass.subject;
        
        // Calculate class coefficient
        const classCoeff = calculateClassCoefficient(
          courseClass.studentCount,
          classCoefficient.standardStudentRange
        );
        
        // Calculate converted periods
        const convertedPeriods = subject.totalPeriods * subject.coefficient * (1 + classCoeff);
        
        // Calculate class salary
        const classSalary = convertedPeriods * hourlyRate.ratePerHour * teacherCoefficientValue;
        
        teacherPeriods += subject.totalPeriods;
        teacherConvertedPeriods += convertedPeriods;
        teacherSalary += classSalary;
      }
      
      // Luôn thêm giáo viên vào báo cáo, kể cả khi không có dữ liệu
      teacherReports.push({
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        teacherCode: teacher.code,
        degree: teacher.degree,
        teacherCoefficient: teacherCoefficientValue,
        classCount: teacherClasses,
        totalPeriods: teacherPeriods,
        totalConvertedPeriods: Math.round(teacherConvertedPeriods * 10) / 10,
        totalSalary: Math.round(teacherSalary)
      });
      
      totalDepartmentClasses += teacherClasses;
      totalDepartmentPeriods += teacherPeriods;
      totalDepartmentConvertedPeriods += teacherConvertedPeriods;
      totalDepartmentSalary += teacherSalary;
    }
    
    // Get semester info if specific semester
    let semesterInfo = null;
    if (semesterId) {
      semesterInfo = await prisma.semester.findUnique({
        where: { id: semesterId }
      });
    }
    
    res.json({
      data: {
        department,
        academicYear,
        semester: semesterInfo,
        coefficients: {
          hourlyRate: hourlyRate.ratePerHour,
          standardStudentRange: classCoefficient.standardStudentRange
        },
        teachers: teacherReports,
        summary: {
          totalClasses: totalDepartmentClasses,
          totalPeriods: totalDepartmentPeriods,
          totalConvertedPeriods: Math.round(totalDepartmentConvertedPeriods * 10) / 10,
          totalSalary: Math.round(totalDepartmentSalary)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// UC4.3: Báo cáo tiền dạy của giáo viên toàn trường
export const getSchoolPayrollReport = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const { semesterId } = req.query; // Optional
    
    // Get all departments
    const departments = await prisma.department.findMany({
      orderBy: { fullName: 'asc' }
    });
    
    if (departments.length === 0) {
      return res.status(404).json({ message: 'Không có khoa nào trong hệ thống' });
    }
    
    // Get rates and coefficients
    const [hourlyRate, classCoefficient] = await Promise.all([
      prisma.hourlyRate.findUnique({ where: { academicYear } }),
      prisma.classCoefficient.findUnique({ where: { academicYear } })
    ]);
    
    if (!hourlyRate || !classCoefficient) {
      return res.status(404).json({ message: 'Chưa thiết lập đầy đủ các hệ số cho năm học này' });
    }
    
    // Build semester filter
    const semesterFilter = semesterId ? { id: semesterId } : { academicYear };
    
    const departmentReports = [];
    let totalSchoolClasses = 0;
    let totalSchoolPeriods = 0;
    let totalSchoolConvertedPeriods = 0;
    let totalSchoolSalary = 0;
    
    for (const department of departments) {
      // Get all assignments for teachers in this department
      const assignments = await prisma.teacherAssignment.findMany({
        where: {
          teacher: {
            departmentId: department.id
          },
          courseClass: {
            semester: semesterFilter
          }
        },
        include: {
          teacher: {
            include: {
              degree: true
            }
          },
          courseClass: {
            include: {
              subject: true,
              semester: true
            }
          }
        }
      });
      
      let departmentClasses = 0;
      let departmentPeriods = 0;
      let departmentConvertedPeriods = 0;
      let departmentSalary = 0;
      
      for (const assignment of assignments) {
        const teacher = assignment.teacher;
        const courseClass = assignment.courseClass;
        const subject = courseClass.subject;
        
        // Get teacher coefficient
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
        
        // Calculate class coefficient
        const classCoeff = calculateClassCoefficient(
          courseClass.studentCount,
          classCoefficient.standardStudentRange
        );
        
        // Calculate converted periods
        const convertedPeriods = subject.totalPeriods * subject.coefficient * (1 + classCoeff);
        
        // Calculate class salary
        const classSalary = convertedPeriods * hourlyRate.ratePerHour * teacherCoefficientValue;
        
        departmentClasses += 1;
        departmentPeriods += subject.totalPeriods;
        departmentConvertedPeriods += convertedPeriods;
        departmentSalary += classSalary;
      }
      
      // Luôn thêm khoa vào báo cáo, kể cả khi không có dữ liệu
      departmentReports.push({
        departmentId: department.id,
        departmentName: department.fullName,
        departmentShortName: department.shortName,
        classCount: departmentClasses,
        totalPeriods: departmentPeriods,
        totalConvertedPeriods: Math.round(departmentConvertedPeriods * 10) / 10,
        totalSalary: Math.round(departmentSalary)
      });
      
      totalSchoolClasses += departmentClasses;
      totalSchoolPeriods += departmentPeriods;
      totalSchoolConvertedPeriods += departmentConvertedPeriods;
      totalSchoolSalary += departmentSalary;
    }
    
    // Get semester info if specific semester
    let semesterInfo = null;
    if (semesterId) {
      semesterInfo = await prisma.semester.findUnique({
        where: { id: semesterId }
      });
    }
    
    res.json({
      data: {
        academicYear,
        semester: semesterInfo,
        coefficients: {
          hourlyRate: hourlyRate.ratePerHour,
          standardStudentRange: classCoefficient.standardStudentRange
        },
        departments: departmentReports,
        summary: {
          totalClasses: totalSchoolClasses,
          totalPeriods: totalSchoolPeriods,
          totalConvertedPeriods: Math.round(totalSchoolConvertedPeriods * 10) / 10,
          totalSalary: Math.round(totalSchoolSalary)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// UC4.1 Excel Export: Báo cáo tiền dạy của giáo viên trong một năm
export const exportTeacherYearlyPayrollReport = async (req, res, next) => {
  try {
    const { teacherId, academicYear } = req.params;
    
    // Get the same data as the regular report
    const reportData = await getTeacherYearlyReportData(teacherId, academicYear);
    
    if (!reportData) {
      return res.status(404).json({ message: 'Không có dữ liệu để xuất báo cáo' });
    }
    
    // Generate Excel file using excelExport helper
    const { exportTeacherYearlyPayrollToExcel } = await import('../helpers/excelExport.js');
    const buffer = await exportTeacherYearlyPayrollToExcel(reportData);
    
    // Set response headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bao-cao-tien-day-giao-vien-${reportData.teacher.code}-${academicYear}.xlsx"`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// UC4.2 Excel Export: Báo cáo tiền dạy của giáo viên một khoa
export const exportDepartmentPayrollReport = async (req, res, next) => {
  try {
    const { departmentId, academicYear } = req.params;
    const { semesterId } = req.query;
    
    // Get the same data as the regular report
    const reportData = await getDepartmentPayrollReportData(departmentId, academicYear, semesterId);
    
    if (!reportData) {
      return res.status(404).json({ message: 'Không có dữ liệu để xuất báo cáo' });
    }
    
    // Generate Excel file using excelExport helper
    const { exportDepartmentPayrollToExcel } = await import('../helpers/excelExport.js');
    const buffer = await exportDepartmentPayrollToExcel(reportData);
    
    // Set response headers for Excel file download
    const semesterSuffix = semesterId ? `-ky-${semesterId}` : '';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bao-cao-tien-day-khoa-${reportData.department.shortName}-${academicYear}${semesterSuffix}.xlsx"`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// UC4.3 Excel Export: Báo cáo tiền dạy của giáo viên toàn trường
export const exportSchoolPayrollReport = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const { semesterId } = req.query;
    
    // Get the same data as the regular report
    const reportData = await getSchoolPayrollReportData(academicYear, semesterId);
    
    if (!reportData) {
      return res.status(404).json({ message: 'Không có dữ liệu để xuất báo cáo' });
    }
    
    // Generate Excel file using excelExport helper
    const { exportSchoolPayrollToExcel } = await import('../helpers/excelExport.js');
    const buffer = await exportSchoolPayrollToExcel(reportData);
    
    // Set response headers for Excel file download
    const semesterSuffix = semesterId ? `-ky-${semesterId}` : '';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bao-cao-tien-day-toan-truong-${academicYear}${semesterSuffix}.xlsx"`);
    
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Helper function to get teacher yearly report data
const getTeacherYearlyReportData = async (teacherId, academicYear) => {
  // Get teacher information
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      degree: true,
      department: true
    }
  });

  if (!teacher) {
    throw new Error('Giáo viên không tìm thấy');
  }

  // Get all semesters in the academic year
  const semesters = await prisma.semester.findMany({
    where: { academicYear },
    orderBy: [
      { termNumber: 'asc' },
      { isSupplementary: 'asc' }
    ]
  });

  if (semesters.length === 0) {
    throw new Error('Không có dữ liệu kỳ học cho năm học này');
  }

  // Get hourly rate and teacher coefficient for the academic year
  const [hourlyRate, teacherCoefficient, classCoefficient] = await Promise.all([
    prisma.hourlyRate.findUnique({ where: { academicYear } }),
    prisma.teacherCoefficient.findUnique({
      where: {
        academicYear_degreeId: {
          academicYear,
          degreeId: teacher.degreeId
        }
      }
    }),
    prisma.classCoefficient.findUnique({ where: { academicYear } })
  ]);

  if (!hourlyRate) {
    throw new Error('Chưa thiết lập định mức tiền theo tiết cho năm học này');
  }

  // Use default coefficient of 1.0 if not found
  const teacherCoefficientValue = teacherCoefficient ? teacherCoefficient.coefficient : 1.0;

  if (!classCoefficient) {
    throw new Error('Chưa thiết lập hệ số lớp cho năm học này');
  }

  const semesterReports = [];
  let totalYearlyClasses = 0;
  let totalYearlyPeriods = 0;
  let totalYearlyConvertedPeriods = 0;
  let totalYearlySalary = 0;

  // Calculate for each semester
  for (const semester of semesters) {
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId,
        courseClass: {
          semesterId: semester.id
        }
      },
      include: {
        courseClass: {
          include: {
            subject: true
          }
        }
      }
    });

    let semesterClasses = assignments.length;
    let semesterPeriods = 0;
    let semesterConvertedPeriods = 0;
    let semesterSalary = 0;

    for (const assignment of assignments) {
      const courseClass = assignment.courseClass;
      const subject = courseClass.subject;

      // Calculate class coefficient
      const classCoeff = calculateClassCoefficient(
        courseClass.studentCount,
        classCoefficient.standardStudentRange
      );

      // Calculate converted periods
      const convertedPeriods = subject.totalPeriods * subject.coefficient * (1 + classCoeff);

      // Calculate class salary
      const classSalary = convertedPeriods * hourlyRate.ratePerHour * teacherCoefficientValue;

      semesterPeriods += subject.totalPeriods;
      semesterConvertedPeriods += convertedPeriods;
      semesterSalary += classSalary;
    }

    const semesterName = `Kỳ ${semester.termNumber}${semester.isSupplementary ? ' (Phụ)' : ''}`;

    semesterReports.push({
      semesterId: semester.id,
      semesterName,
      termNumber: semester.termNumber,
      isSupplementary: semester.isSupplementary,
      classCount: semesterClasses,
      totalPeriods: semesterPeriods,
      totalConvertedPeriods: Math.round(semesterConvertedPeriods * 10) / 10,
      totalSalary: Math.round(semesterSalary)
    });

    totalYearlyClasses += semesterClasses;
    totalYearlyPeriods += semesterPeriods;
    totalYearlyConvertedPeriods += semesterConvertedPeriods;
    totalYearlySalary += semesterSalary;
  }

  return {
    teacher: {
      id: teacher.id,
      fullName: teacher.fullName,
      code: teacher.code,
      degree: teacher.degree,
      department: teacher.department
    },
    academicYear,
    coefficients: {
      teacherCoefficient: teacherCoefficientValue,
      hourlyRate: hourlyRate.ratePerHour,
      standardStudentRange: classCoefficient.standardStudentRange
    },
    semesters: semesterReports,
    summary: {
      totalClasses: totalYearlyClasses,
      totalPeriods: totalYearlyPeriods,
      totalConvertedPeriods: Math.round(totalYearlyConvertedPeriods * 10) / 10,
      totalSalary: Math.round(totalYearlySalary)
    }
  };
};

// Helper function to get department payroll report data
const getDepartmentPayrollReportData = async (departmentId, academicYear, semesterId) => {
  // Get department information
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  });

  if (!department) {
    throw new Error('Khoa không tìm thấy');
  }

  // Get teachers in the department
  const teachers = await prisma.teacher.findMany({
    where: { departmentId },
    include: {
      degree: true
    },
    orderBy: { fullName: 'asc' }
  });

  if (teachers.length === 0) {
    throw new Error('Không có giáo viên nào trong khoa này');
  }

  // Get rates and coefficients
  const [hourlyRate, classCoefficient] = await Promise.all([
    prisma.hourlyRate.findUnique({ where: { academicYear } }),
    prisma.classCoefficient.findUnique({ where: { academicYear } })
  ]);

  if (!hourlyRate || !classCoefficient) {
    throw new Error('Chưa thiết lập đầy đủ các hệ số cho năm học này');
  }

  // Build semester filter
  const semesterFilter = semesterId ? { id: semesterId } : { academicYear };

  const teacherReports = [];
  let totalDepartmentClasses = 0;
  let totalDepartmentPeriods = 0;
  let totalDepartmentConvertedPeriods = 0;
  let totalDepartmentSalary = 0;

  for (const teacher of teachers) {
    // Get teacher coefficient
    const teacherCoefficient = await prisma.teacherCoefficient.findUnique({
      where: {
        academicYear_degreeId: {
          academicYear,
          degreeId: teacher.degreeId
        }
      }
    });

    let teacherClasses = 0;
    let teacherPeriods = 0;
    let teacherConvertedPeriods = 0;
    let teacherSalary = 0;

    // Use default coefficient of 1.0 if not found
    const teacherCoefficientValue = teacherCoefficient ? teacherCoefficient.coefficient : 1.0;

    // Get assignments for the teacher
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId: teacher.id,
        courseClass: {
          semester: semesterFilter
        }
      },
      include: {
        courseClass: {
          include: {
            subject: true,
            semester: true
          }
        }
      }
    });

    teacherClasses = assignments.length;

    for (const assignment of assignments) {
      const courseClass = assignment.courseClass;
      const subject = courseClass.subject;

      // Calculate class coefficient
      const classCoeff = calculateClassCoefficient(
        courseClass.studentCount,
        classCoefficient.standardStudentRange
      );

      // Calculate converted periods
      const convertedPeriods = subject.totalPeriods * subject.coefficient * (1 + classCoeff);

      // Calculate class salary
      const classSalary = convertedPeriods * hourlyRate.ratePerHour * teacherCoefficientValue;

      teacherPeriods += subject.totalPeriods;
      teacherConvertedPeriods += convertedPeriods;
      teacherSalary += classSalary;
    }

    // Always add teacher to report, even when no data
    teacherReports.push({
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      teacherCode: teacher.code,
      degree: teacher.degree,
      teacherCoefficient: teacherCoefficientValue,
      classCount: teacherClasses,
      totalPeriods: teacherPeriods,
      totalConvertedPeriods: Math.round(teacherConvertedPeriods * 10) / 10,
      totalSalary: Math.round(teacherSalary)
    });

    totalDepartmentClasses += teacherClasses;
    totalDepartmentPeriods += teacherPeriods;
    totalDepartmentConvertedPeriods += teacherConvertedPeriods;
    totalDepartmentSalary += teacherSalary;
  }

  // Get semester info if specific semester
  let semesterInfo = null;
  if (semesterId) {
    semesterInfo = await prisma.semester.findUnique({
      where: { id: semesterId }
    });
  }

  return {
    department,
    academicYear,
    semester: semesterInfo,
    coefficients: {
      hourlyRate: hourlyRate.ratePerHour,
      standardStudentRange: classCoefficient.standardStudentRange
    },
    teachers: teacherReports,
    summary: {
      totalClasses: totalDepartmentClasses,
      totalPeriods: totalDepartmentPeriods,
      totalConvertedPeriods: Math.round(totalDepartmentConvertedPeriods * 10) / 10,
      totalSalary: Math.round(totalDepartmentSalary)
    }
  };
};

// Helper function to get school payroll report data
const getSchoolPayrollReportData = async (academicYear, semesterId) => {
  // Get all departments
  const departments = await prisma.department.findMany({
    orderBy: { fullName: 'asc' }
  });

  if (departments.length === 0) {
    throw new Error('Không có khoa nào trong hệ thống');
  }

  // Get rates and coefficients
  const [hourlyRate, classCoefficient] = await Promise.all([
    prisma.hourlyRate.findUnique({ where: { academicYear } }),
    prisma.classCoefficient.findUnique({ where: { academicYear } })
  ]);

  if (!hourlyRate || !classCoefficient) {
    throw new Error('Chưa thiết lập đầy đủ các hệ số cho năm học này');
  }

  // Build semester filter
  const semesterFilter = semesterId ? { id: semesterId } : { academicYear };

  const departmentReports = [];
  let totalSchoolClasses = 0;
  let totalSchoolPeriods = 0;
  let totalSchoolConvertedPeriods = 0;
  let totalSchoolSalary = 0;

  for (const department of departments) {
    // Get all assignments for teachers in this department
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacher: {
          departmentId: department.id
        },
        courseClass: {
          semester: semesterFilter
        }
      },
      include: {
        teacher: {
          include: {
            degree: true
          }
        },
        courseClass: {
          include: {
            subject: true,
            semester: true
          }
        }
      }
    });

    let departmentClasses = 0;
    let departmentPeriods = 0;
    let departmentConvertedPeriods = 0;
    let departmentSalary = 0;

    for (const assignment of assignments) {
      const teacher = assignment.teacher;
      const courseClass = assignment.courseClass;
      const subject = courseClass.subject;

      // Get teacher coefficient
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

      // Calculate class coefficient
      const classCoeff = calculateClassCoefficient(
        courseClass.studentCount,
        classCoefficient.standardStudentRange
      );

      // Calculate converted periods
      const convertedPeriods = subject.totalPeriods * subject.coefficient * (1 + classCoeff);

      // Calculate class salary
      const classSalary = convertedPeriods * hourlyRate.ratePerHour * teacherCoefficientValue;

      departmentClasses += 1;
      departmentPeriods += subject.totalPeriods;
      departmentConvertedPeriods += convertedPeriods;
      departmentSalary += classSalary;
    }

    // Always add department to report, even when no data
    departmentReports.push({
      departmentId: department.id,
      departmentName: department.fullName,
      departmentShortName: department.shortName,
      classCount: departmentClasses,
      totalPeriods: departmentPeriods,
      totalConvertedPeriods: Math.round(departmentConvertedPeriods * 10) / 10,
      totalSalary: Math.round(departmentSalary)
    });

    totalSchoolClasses += departmentClasses;
    totalSchoolPeriods += departmentPeriods;
    totalSchoolConvertedPeriods += departmentConvertedPeriods;
    totalSchoolSalary += departmentSalary;
  }

  // Get semester info if specific semester
  let semesterInfo = null;
  if (semesterId) {
    semesterInfo = await prisma.semester.findUnique({
      where: { id: semesterId }
    });
  }

  return {
    academicYear,
    semester: semesterInfo,
    coefficients: {
      hourlyRate: hourlyRate.ratePerHour,
      standardStudentRange: classCoefficient.standardStudentRange
    },
    departments: departmentReports,
    summary: {
      totalClasses: totalSchoolClasses,
      totalPeriods: totalSchoolPeriods,
      totalConvertedPeriods: Math.round(totalSchoolConvertedPeriods * 10) / 10,
      totalSalary: Math.round(totalSchoolSalary)
    }
  };
}; 