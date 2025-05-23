import { PrismaClient } from '@prisma/client';
import { createSubjectSchema, updateSubjectSchema } from '../validators/subjectValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Generate subject code with format HPxxxx
const generateSubjectCode = async () => {
  // Find the highest code number
  const lastSubject = await prisma.subject.findFirst({
    where: {
      code: {
        startsWith: 'HP'
      }
    },
    orderBy: {
      code: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastSubject) {
    const currentNumber = parseInt(lastSubject.code.substring(2));
    nextNumber = currentNumber + 1;
  }
  
  return `HP${nextNumber.toString().padStart(4, '0')}`;
};

// [GET] /api/subjects
export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        department: {
          select: {
            id: true,
            fullName: true,
            shortName: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ data: subjects });
  } catch (error) {
    next(error); 
  }
};

// [GET] /api/subjects/:id
export const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            fullName: true,
            shortName: true
          }
        }
      }
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json({ data: subject });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/subjects
export const createSubject = async (req, res, next) => {
  try {
    const validatedData = createSubjectSchema.parse(req.body);
    
    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: validatedData.departmentId }
    });
    
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }
    
    // Generate unique subject code
    const code = await generateSubjectCode();
    
    const newSubject = await prisma.subject.create({
      data: {
        ...validatedData,
        id: uuidv7(),
        code
      },
      include: {
        department: {
          select: {
            id: true,
            fullName: true,
            shortName: true
          }
        }
      }
    });
    
    res.status(201).json({ data: newSubject.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/subjects/:id
export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateSubjectSchema.parse(req.body);
    
    const subject = await prisma.subject.findUnique({
      where: { id }
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if department exists (if departmentId is being updated)
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId }
      });
      
      if (!department) {
        return res.status(400).json({ message: 'Department not found' });
      }
    }
    
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            fullName: true,
            shortName: true
          }
        }
      }
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

// [DELETE] /api/subjects/:id  
export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: { id }
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // TODO: Check if subject is being used in course classes when that feature is implemented
    // For now, we allow deletion
    
    await prisma.subject.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true }); 
  } catch (error) {
    next(error);
  }
}; 