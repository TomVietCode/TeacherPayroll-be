import { PrismaClient } from '@prisma/client';
import { createSubjectSchema, updateSubjectSchema } from '../validators/subjectValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Generate subject code with format: Department Short Name + 2 digits (e.g., CNTT01, CNTT02)
const generateSubjectCode = async (departmentId) => {
  // Get department information
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { shortName: true }
  });
  
  if (!department) {
    throw new Error('Department not found');
  }
  
  // Find the highest code number for this department
  const lastSubject = await prisma.subject.findFirst({
    where: {
      code: {
        startsWith: department.shortName
      }
    },
    orderBy: {
      code: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastSubject) {
    // Extract the number part from the code (e.g., "01" from "CNTT01")
    const numberPart = lastSubject.code.substring(department.shortName.length);
    const currentNumber = parseInt(numberPart);
    if (!isNaN(currentNumber)) {
      nextNumber = currentNumber + 1;
    }
  }
  
  return `${department.shortName}${nextNumber.toString().padStart(2, '0')}`;
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
    
    // Check if subject name already exists in the same department
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: validatedData.name,
        departmentId: validatedData.departmentId
      }
    });
    
    if (existingSubject) {
      return res.status(400).json({ message: 'Tên học phần đã tồn tại trong khoa này' });
    }
    
    // Generate unique subject code
    const code = await generateSubjectCode(validatedData.departmentId);
    
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
    
    // Check if subject name already exists in the same department (excluding current subject)
    if (validatedData.name) {
      const departmentId = validatedData.departmentId || subject.departmentId;
      const existingSubject = await prisma.subject.findFirst({
        where: {
          name: validatedData.name,
          departmentId: departmentId,
          id: { not: id }
        }
      });
      
      if (existingSubject) {
        return res.status(400).json({ message: 'Tên học phần đã tồn tại trong khoa này' });
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
      where: { id },
      include: {
        courseClasses: true
      }
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if subject is being used in course classes
    if (subject.courseClasses.length > 0) {
      return res.status(400).json({ message: 'Không thể xóa vì học phần đang được sử dụng' });
    }
    
    await prisma.subject.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true }); 
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(400).json({ message: 'Không thể xóa vì học phần đang được sử dụng' });
    }
    next(error);
  }
}; 