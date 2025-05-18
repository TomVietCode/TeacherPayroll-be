import { PrismaClient } from '@prisma/client';
import { createTeacherSchema, updateTeacherSchema } from '../validators/teacherValidator.js';
import { v7 as uuidv7 } from 'uuid';
import { generateCode } from './../helpers/generateCode.js';

const prisma = new PrismaClient();

// [GET] /api/teachers
export const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        department: true,
        degree: true
      },
      orderBy: { fullName: 'asc' }
    });
    res.json({ data: teachers });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/teachers/:id
export const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        department: true,
        degree: true
      }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({ data: teacher });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/teachers
export const createTeacher = async (req, res, next) => {
  try {
    const validatedData = createTeacherSchema.parse(req.body);
    
    // Auto-generate code if not provided by user
    let teacherCode = validatedData.code;
    let codeExists = false;
    
    if (!teacherCode) {
      // Generate a unique code
      do {
        teacherCode = generateCode('TC');
        // Check if the generated code already exists
        const existingCode = await prisma.teacher.findUnique({
          where: { code: teacherCode }
        });
        codeExists = !!existingCode;
      } while (codeExists);
    } else {
      // Check if user-provided code already exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { code: teacherCode }
      });
      
      if (existingTeacher) {
        return res.status(400).json({ message: 'Teacher code is already in use' });
      }
    }
    
    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: validatedData.departmentId }
    });
    
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }
    
    // Check if degree exists
    const degree = await prisma.degree.findUnique({
      where: { id: validatedData.degreeId }
    });
    
    if (!degree) {
      return res.status(400).json({ message: 'Degree not found' });
    }
    
    // Convert dateOfBirth string to Date object
    const dateOfBirth = new Date(validatedData.dateOfBirth);
    
    // Extra validation for date of birth
    const today = new Date();
    if (dateOfBirth > today) {
      return res.status(400).json({ 
        message: 'Date of birth cannot be in the future' 
      });
    }
    
    // Create new teacher
    const newTeacher = await prisma.teacher.create({
      data: {
        ...validatedData,
        code: teacherCode, // Use the generated or user-provided code
        id: uuidv7(),
        dateOfBirth
      },
      include: {
        department: true,
        degree: true
      }
    });
    
    res.status(201).json({ data: newTeacher.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};

// [PATCH] /api/teachers/:id
export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateTeacherSchema.parse(req.body);
    
    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Check if code is being updated and is already in use
    if (validatedData.code && validatedData.code !== teacher.code) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: { 
          code: validatedData.code,
          id: { not: id }
        }
      });
      
      if (existingTeacher) {
        return res.status(400).json({ message: 'Teacher code is already in use' });
      }
    }
    
    // Check if department exists if being updated
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId }
      });
      
      if (!department) {
        return res.status(400).json({ message: 'Department not found' });
      }
    }
    
    // Check if degree exists if being updated
    if (validatedData.degreeId) {
      const degree = await prisma.degree.findUnique({
        where: { id: validatedData.degreeId }
      });
      
      if (!degree) {
        return res.status(400).json({ message: 'Degree not found' });
      }
    }
    
    // Process date if it's being updated
    const data = { ...validatedData };
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
      
      // Extra validation for date of birth
      const today = new Date();
      if (data.dateOfBirth > today) {
        return res.status(400).json({ 
          message: 'Date of birth cannot be in the future' 
        });
      }
    }
    
    // Update teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data,
      include: {
        department: true,
        degree: true
      }
    });
    
    res.json({ data: true });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};

// [DELETE] /api/teachers/:id
export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.teacher.findUnique({
      where: { id }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    await prisma.teacher.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true });
  } catch (error) {
    next(error);
  }
}; 