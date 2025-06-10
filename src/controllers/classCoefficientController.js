import { PrismaClient } from '@prisma/client';
import { createClassCoefficientSchema, updateClassCoefficientSchema, VALID_STUDENT_RANGES } from '../validators/classCoefficientValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to calculate class coefficient based on student count and standard range
export const calculateClassCoefficient = (studentCount, standardRange) => {
  // Find the index of the standard range
  const standardIndex = VALID_STUDENT_RANGES.indexOf(standardRange);
  
  // Find the range that contains the student count
  let studentRangeIndex = -1;
  
  if (studentCount < 20) {
    studentRangeIndex = 0; // '<20'
  } else if (studentCount >= 100) {
    studentRangeIndex = 9; // '100+'
  } else {
    // Find the appropriate range (20-29, 30-39, etc.)
    const rangeStart = Math.floor(studentCount / 10) * 10;
    const rangeEnd = rangeStart + 9;
    const rangeName = `${rangeStart}-${rangeEnd}`;
    studentRangeIndex = VALID_STUDENT_RANGES.indexOf(rangeName);
  }
  
  if (standardIndex === -1 || studentRangeIndex === -1) {
    return 0; // Default coefficient if ranges not found
  }
  
  // Calculate coefficient: each step from standard is 0.1
  const difference = studentRangeIndex - standardIndex;
  return difference * 0.1;
};

// [GET] /api/class-coefficients
export const getAllClassCoefficients = async (req, res, next) => {
  try {
    const classCoefficients = await prisma.classCoefficient.findMany({
      orderBy: { academicYear: 'desc' }
    });
    res.json({ data: classCoefficients });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/class-coefficients/:id
export const getClassCoefficientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classCoefficient = await prisma.classCoefficient.findUnique({
      where: { id }
    });
    
    if (!classCoefficient) {
      return res.status(404).json({ message: 'Hệ số lớp không tìm thấy' });
    }
    
    res.json({ data: classCoefficient });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/class-coefficients/academic-year/:academicYear
export const getClassCoefficientByAcademicYear = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const classCoefficient = await prisma.classCoefficient.findUnique({
      where: { academicYear }
    });
    
    if (!classCoefficient) {
      // Return default standard range if not found
      return res.json({ 
        data: {
          id: null,
          academicYear,
          standardStudentRange: '40-49', // Default standard
          createdAt: null,
          updatedAt: null
        }
      });
    }
    
    res.json({ data: classCoefficient });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/class-coefficients
export const createClassCoefficient = async (req, res, next) => {
  try {
    const validatedData = createClassCoefficientSchema.parse(req.body);
    
    // Check if academic year already exists
    const existingCoefficient = await prisma.classCoefficient.findUnique({
      where: { academicYear: validatedData.academicYear }
    });
    
    if (existingCoefficient) {
      return res.status(400).json({ message: 'Năm học đã có hệ số lớp, vui lòng chọn năm khác' });
    }
    
    const newClassCoefficient = await prisma.classCoefficient.create({
      data: {
        ...validatedData,
        id: uuidv7()
      }
    });
    
    res.status(201).json({ data: newClassCoefficient.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/class-coefficients/:id
export const updateClassCoefficient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateClassCoefficientSchema.parse(req.body);
    
    const classCoefficient = await prisma.classCoefficient.findUnique({
      where: { id }
    });
    
    if (!classCoefficient) {
      return res.status(404).json({ message: 'Hệ số lớp không tìm thấy' });
    }
    
    const updatedClassCoefficient = await prisma.classCoefficient.update({
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

// [PATCH] /api/class-coefficients/academic-year/:academicYear
export const updateClassCoefficientByAcademicYear = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const validatedData = updateClassCoefficientSchema.parse(req.body);
    
    // Check if exists
    const existing = await prisma.classCoefficient.findUnique({
      where: { academicYear }
    });
    
    if (existing) {
      // Update existing
      const updated = await prisma.classCoefficient.update({
        where: { academicYear },
        data: validatedData
      });
      res.json({ data: updated });
    } else {
      // Create new
      const created = await prisma.classCoefficient.create({
        data: {
          id: uuidv7(),
          academicYear,
          ...validatedData
        }
      });
      res.json({ data: created });
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [DELETE] /api/class-coefficients/:id
export const deleteClassCoefficient = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classCoefficient = await prisma.classCoefficient.findUnique({
      where: { id }
    });
    
    if (!classCoefficient) {
      return res.status(404).json({ message: 'Hệ số lớp không tìm thấy' });
    }
    
    // TODO: Check if coefficient is being used in salary calculations
    
    await prisma.classCoefficient.delete({
      where: { id }
    });
    
    res.json({ data: true });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/class-coefficients/ranges
export const getValidStudentRanges = async (req, res, next) => {
  try {
    res.json({ data: VALID_STUDENT_RANGES });
  } catch (error) {
    next(error);
  }
}; 