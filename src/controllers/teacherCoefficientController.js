import { PrismaClient } from '@prisma/client';
import { 
  createTeacherCoefficientSchema, 
  updateTeacherCoefficientSchema, 
  batchUpdateTeacherCoefficientsSchema 
} from '../validators/teacherCoefficientValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Default coefficient values for degrees
const DEFAULT_COEFFICIENTS = {
  'Cử nhân': 1.3,
  'Thạc sĩ': 1.5,
  'Tiến sĩ': 1.7,
  'Phó giáo sư': 2.0,
  'Giáo sư': 2.5
};

// [GET] /api/teacher-coefficients
export const getAllTeacherCoefficients = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    
    const where = academicYear ? { academicYear } : {};
    
    const coefficients = await prisma.teacherCoefficient.findMany({
      where,
      include: {
        degree: {
          select: {
            id: true,
            fullName: true,
            shortName: true
          }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { degree: { fullName: 'asc' } }
      ]
    });
    
    res.json({ data: coefficients });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/teacher-coefficients/academic-year/:academicYear
export const getTeacherCoefficientsByAcademicYear = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    
    // Get all degrees
    const degrees = await prisma.degree.findMany({
      orderBy: { fullName: 'asc' }
    });
    
    // Get existing coefficients for this academic year
    const existingCoefficients = await prisma.teacherCoefficient.findMany({
      where: { academicYear },
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
    
    // Create a map of existing coefficients
    const coefficientMap = new Map();
    existingCoefficients.forEach(coeff => {
      coefficientMap.set(coeff.degreeId, coeff);
    });
    
    // Build response with default values for missing coefficients
    const result = degrees.map(degree => {
      const existing = coefficientMap.get(degree.id);
      if (existing) {
        return existing;
      }
      
      // Return default coefficient
      const defaultCoeff = DEFAULT_COEFFICIENTS[degree.fullName] || 1.0;
      return {
        id: null, // Indicates this is a default value, not saved yet
        academicYear,
        degreeId: degree.id,
        coefficient: defaultCoeff,
        degree: {
          id: degree.id,
          fullName: degree.fullName,
          shortName: degree.shortName
        },
        createdAt: null,
        updatedAt: null
      };
    });
    
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/teacher-coefficients
export const createTeacherCoefficient = async (req, res, next) => {
  try {
    const validatedData = createTeacherCoefficientSchema.parse(req.body);
    
    // Check if degree exists
    const degree = await prisma.degree.findUnique({
      where: { id: validatedData.degreeId }
    });
    
    if (!degree) {
      return res.status(400).json({ message: 'Bằng cấp không tìm thấy' });
    }
    
    // Check if coefficient already exists for this academic year and degree
    const existing = await prisma.teacherCoefficient.findUnique({
      where: {
        academicYear_degreeId: {
          academicYear: validatedData.academicYear,
          degreeId: validatedData.degreeId
        }
      }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Hệ số cho bằng cấp này đã tồn tại trong năm học' });
    }
    
    const newCoefficient = await prisma.teacherCoefficient.create({
      data: {
        ...validatedData,
        id: uuidv7()
      },
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
    
    res.status(201).json({ data: newCoefficient.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/teacher-coefficients/batch
export const batchUpdateTeacherCoefficients = async (req, res, next) => {
  try {
    const validatedData = batchUpdateTeacherCoefficientsSchema.parse(req.body);
    
    const results = [];
    
    // Process each coefficient
    for (const coeffData of validatedData.coefficients) {
      // Check if coefficient exists
      const existing = await prisma.teacherCoefficient.findUnique({
        where: {
          academicYear_degreeId: {
            academicYear: validatedData.academicYear,
            degreeId: coeffData.degreeId
          }
        }
      });
      
      if (existing) {
        // Update existing coefficient
        const updated = await prisma.teacherCoefficient.update({
          where: { id: existing.id },
          data: { coefficient: coeffData.coefficient },
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
        results.push(updated);
      } else {
        // Create new coefficient
        const created = await prisma.teacherCoefficient.create({
          data: {
            id: uuidv7(),
            academicYear: validatedData.academicYear,
            degreeId: coeffData.degreeId,
            coefficient: coeffData.coefficient
          },
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
        results.push(created);
      }
    }
    
    res.json({ data: results });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/teacher-coefficients/:id
export const updateTeacherCoefficient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateTeacherCoefficientSchema.parse(req.body);
    
    const coefficient = await prisma.teacherCoefficient.findUnique({
      where: { id }
    });
    
    if (!coefficient) {
      return res.status(404).json({ message: 'Hệ số giáo viên không tìm thấy' });
    }
    
    const updatedCoefficient = await prisma.teacherCoefficient.update({
      where: { id },
      data: validatedData,
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

// [DELETE] /api/teacher-coefficients/:id
export const deleteTeacherCoefficient = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const coefficient = await prisma.teacherCoefficient.findUnique({
      where: { id }
    });
    
    if (!coefficient) {
      return res.status(404).json({ message: 'Hệ số giáo viên không tìm thấy' });
    }
    
    // TODO: Check if coefficient is being used in salary calculations
    
    await prisma.teacherCoefficient.delete({
      where: { id }
    });
    
    res.json({ data: true });
  } catch (error) {
    next(error);
  }
}; 