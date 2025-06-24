import { PrismaClient } from '@prisma/client';
import { createCourseClassSchema, updateCourseClassSchema } from '../validators/courseClassValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to generate course class code: SubjectCode-Term-Year(Nxx) (e.g., CNTT01-1-26(N01), CNTT01-1(p)-26(N02))
const generateCourseClassCode = (subjectCode, classNumber, semester) => {
  const formattedClassNumber = classNumber.toString().padStart(2, '0');
  const semesterSuffix = semester.isSupplementary ? `${semester.termNumber}(p)` : semester.termNumber;
  
  // Extract last 2 digits from academic year (e.g., "2026-2027" -> "26")
  const yearSuffix = semester.academicYear.split('-')[1].slice(-2);
  
  return `${subjectCode}-${semesterSuffix}-${yearSuffix}(N${formattedClassNumber})`;
};

// Helper function to generate course class name: "Subject Name (Nyy)"
const generateCourseClassName = (subjectName, classNumber) => {
  const formattedClassNumber = classNumber.toString().padStart(2, '0');
  return `${subjectName} (N${formattedClassNumber})`;
};

// [GET] /api/course-classes
export const getAllCourseClasses = async (req, res, next) => {
  try {
    const { semesterId, subjectId } = req.query;
    
    // Build where clause based on query parameters
    const where = {};
    if (semesterId) where.semesterId = semesterId;
    if (subjectId) where.subjectId = subjectId;
    
    const courseClasses = await prisma.courseClass.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            coefficient: true,
            totalPeriods: true,
            department: {
              select: {
                id: true,
                shortName: true,
                fullName: true
              }
            }
          }
        },
        semester: {
          select: {
            id: true,
            termNumber: true,
            isSupplementary: true,
            academicYear: true
          }
        },
        assignments: {
          select: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: [
        { semester: { academicYear: 'desc' } },
        { semester: { termNumber: 'asc' } },
        { subject: { name: 'asc' } },
        { classNumber: 'asc' }
      ]
    });
    
    res.json({ data: courseClasses });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/course-classes/:id
export const getCourseClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const courseClass = await prisma.courseClass.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            coefficient: true,
            totalPeriods: true,
            department: {
              select: {
                id: true,
                shortName: true,
                fullName: true
              }
            }
          }
        },
        semester: {
          select: {
            id: true,
            termNumber: true,
            isSupplementary: true,
            academicYear: true
          }
        }
      }
    });
    
    if (!courseClass) {
      return res.status(404).json({ message: 'Course class not found' });
    }
    
    res.json({ data: courseClass });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/course-classes
export const createCourseClasses = async (req, res, next) => {
  try {
    const validatedData = createCourseClassSchema.parse(req.body);
    
    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: validatedData.subjectId }
    });
    
    if (!subject) {
      return res.status(400).json({ message: 'Subject not found' });
    }
    
    // Check if semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: validatedData.semesterId }
    });
    
    if (!semester) {
      return res.status(400).json({ message: 'Semester not found' });
    }
    
    // Find the highest class number for this subject and semester
    const existingClasses = await prisma.courseClass.findMany({
      where: {
        subjectId: validatedData.subjectId,
        semesterId: validatedData.semesterId
      },
      orderBy: { classNumber: 'desc' }
    });
    
    // Check if creating new classes would exceed the limit
    if (existingClasses.length + validatedData.numberOfClasses > 10) {
      return res.status(400).json({ 
        message: `Cannot create ${validatedData.numberOfClasses} more classes. Current: ${existingClasses.length}, Maximum: 10` 
      });
    }
    
    const startingClassNumber = existingClasses.length > 0 ? existingClasses[0].classNumber + 1 : 1;
    
    // Create multiple course classes
    const createdClasses = [];
    for (let i = 0; i < validatedData.numberOfClasses; i++) {
      const classNumber = startingClassNumber + i;
      const code = generateCourseClassCode(subject.code, classNumber, semester);
      const name = generateCourseClassName(subject.name, classNumber);
      
      const newCourseClass = await prisma.courseClass.create({
        data: {
          id: uuidv7(),
          code,
          name,
          classNumber,
          studentCount: 0,
          maxStudents: validatedData.maxStudents,
          subjectId: validatedData.subjectId,
          semesterId: validatedData.semesterId
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          semester: {
            select: {
              id: true,
              termNumber: true,
              isSupplementary: true,
              academicYear: true
            }
          }
        }
      });
      
      createdClasses.push(newCourseClass);
    }
    
    res.status(201).json({ 
      data: createdClasses.map(cls => cls.id),
      message: `Created ${validatedData.numberOfClasses} course classes successfully`
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/course-classes/:id
export const updateCourseClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateCourseClassSchema.parse(req.body);
    
    const courseClass = await prisma.courseClass.findUnique({
      where: { id }
    });
    
    if (!courseClass) {
      return res.status(404).json({ message: 'Course class not found' });
    }
    
    const updatedCourseClass = await prisma.courseClass.update({
      where: { id },
      data: validatedData
    });
    
    res.json({ data: true });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [DELETE] /api/course-classes/:id  
export const deleteCourseClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const courseClass = await prisma.courseClass.findUnique({
      where: { id },
      include: {
        assignments: true
      }
    });
    
    if (!courseClass) {
      return res.status(404).json({ message: 'Course class not found' });
    }
    
    // Check if course class has assigned teachers
    if (courseClass.assignments.length > 0) {
      return res.status(400).json({ message: 'Không thể xóa vì lớp đã được phân công giảng viên' });
    }
    
    await prisma.courseClass.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true }); 
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(400).json({ message: 'Không thể xóa vì lớp đã được phân công giảng viên' });
    }
    next(error);
  }
};

// [GET] /api/course-classes/by-semester/:semesterId
export const getCourseClassesBySemester = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    
    // Group course classes by subject for the specific semester
    const courseClasses = await prisma.courseClass.findMany({
      where: { semesterId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            department: {
              select: {
                id: true,
                shortName: true,
                fullName: true
              }
            }
          }
        },
        assignments: {
          select: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { classNumber: 'asc' }
      ]
    });
    
    // Group by subject
    const groupedBySubject = courseClasses.reduce((acc, courseClass) => {
      const subjectId = courseClass.subject.id;
      
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: courseClass.subject,
          classes: []
        };
      }
      
      acc[subjectId].classes.push({
        id: courseClass.id,
        code: courseClass.code,
        name: courseClass.name,
        studentCount: courseClass.studentCount,
        maxStudents: courseClass.maxStudents,
        classNumber: courseClass.classNumber,
        teacher: courseClass.assignments.length > 0 ? courseClass.assignments[0].teacher : null
      });
      
      return acc;
    }, {});
    
    res.json({ data: Object.values(groupedBySubject) });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/course-classes/by-teacher/:teacherId/semester/:semesterId
export const getCourseClassesByTeacherAndSemester = async (req, res, next) => {
  try {
    const { teacherId, semesterId } = req.params;
    
    // Get course classes assigned to the specific teacher for the semester
    const courseClasses = await prisma.courseClass.findMany({
      where: { 
        semesterId,
        assignments: {
          some: {
            teacherId
          }
        }
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            totalPeriods: true,
            department: {
              select: {
                id: true,
                shortName: true,
                fullName: true
              }
            }
          }
        },
        assignments: {
          where: {
            teacherId
          },
          select: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { classNumber: 'asc' }
      ]
    });
    
    // Group by subject
    const groupedBySubject = courseClasses.reduce((acc, courseClass) => {
      const subjectId = courseClass.subject.id;
      
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: courseClass.subject,
          classes: []
        };
      }
      
      acc[subjectId].classes.push({
        id: courseClass.id,
        code: courseClass.code,
        name: courseClass.name,
        studentCount: courseClass.studentCount,
        maxStudents: courseClass.maxStudents,
        classNumber: courseClass.classNumber,
        teacher: courseClass.assignments[0]?.teacher || null
      });
      
      return acc;
    }, {});
    
    res.json({ data: Object.values(groupedBySubject) });
  } catch (error) {
    next(error);
  }
}; 