import { PrismaClient } from '@prisma/client';
import { createCourseClassSchema, updateCourseClassSchema } from '../validators/courseClassValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to generate course class code: LHPxxxxNyy
const generateCourseClassCode = (subjectCode, classNumber) => {
  const subjectCodeNumbers = subjectCode.substring(2); // Get 4 digits from HPxxxx
  const formattedClassNumber = classNumber.toString().padStart(2, '0');
  return `LHP${subjectCodeNumbers}N${formattedClassNumber}`;
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
            totalPeriods: true
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
            totalPeriods: true
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
    
    const startingClassNumber = existingClasses.length > 0 ? existingClasses[0].classNumber + 1 : 1;
    
    // Create multiple course classes
    const createdClasses = [];
    for (let i = 0; i < validatedData.numberOfClasses; i++) {
      const classNumber = startingClassNumber + i;
      const code = generateCourseClassCode(subject.code, classNumber);
      const name = generateCourseClassName(subject.name, classNumber);
      
      const newCourseClass = await prisma.courseClass.create({
        data: {
          id: uuidv7(),
          code,
          name,
          classNumber,
          studentCount: 0,
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
      where: { id }
    });
    
    if (!courseClass) {
      return res.status(404).json({ message: 'Course class not found' });
    }
    
    // TODO: Check if course class has assigned teachers when UC2.4 is implemented
    // For now, we allow deletion
    
    await prisma.courseClass.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true }); 
  } catch (error) {
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
            code: true
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
        classNumber: courseClass.classNumber
      });
      
      return acc;
    }, {});
    
    res.json({ data: Object.values(groupedBySubject) });
  } catch (error) {
    next(error);
  }
}; 