import { PrismaClient } from '@prisma/client';
import { createSemesterSchema, updateSemesterSchema } from '../validators/semesterValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to generate display name
const generateDisplayName = (termNumber, isSupplementary) => {
  return isSupplementary ? `${termNumber}-phụ` : `${termNumber}`;
};

// Helper function to check date conflicts
const checkDateConflicts = async (startDate, endDate, excludeId = null) => {
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);
  
  // Get all existing semesters
  const existingSemesters = await prisma.semester.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { id: true, startDate: true, endDate: true, termNumber: true, isSupplementary: true, academicYear: true }
  });
  
  for (const semester of existingSemesters) {
    const existingStart = new Date(semester.startDate);
    const existingEnd = new Date(semester.endDate);
    
    // Check if start date is exactly the same
    if (newStart.getTime() === existingStart.getTime()) {
      return { 
        conflict: true, 
        message: 'Start date is already in use by another semester' 
      };
    }
    
    // Check minimum 45 days gap between semesters
    const timeDiffStart = Math.abs(newStart.getTime() - existingStart.getTime());
    const timeDiffEnd = Math.abs(newStart.getTime() - existingEnd.getTime());
    const daysDiffStart = timeDiffStart / (1000 * 60 * 60 * 24);
    const daysDiffEnd = timeDiffEnd / (1000 * 60 * 60 * 24);
    
    if (daysDiffStart < 45 || daysDiffEnd < 45) {
      return { 
        conflict: true, 
        message: 'Start date must be at least 45 days away from other semesters' 
      };
    }
  }
  
  return { conflict: false };
};

// [GET] /api/semesters
export const getAllSemesters = async (req, res, next) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: [
        { academicYear: 'desc' },
        { termNumber: 'asc' },
        { isSupplementary: 'asc' }
      ]
    });
    
    // Add display name to each semester
    const semestersWithDisplayName = semesters.map(semester => ({
      ...semester,
      displayName: generateDisplayName(semester.termNumber, semester.isSupplementary)
    }));
    
    res.json({ data: semestersWithDisplayName });
  } catch (error) {
    next(error); 
  }
};

// [GET] /api/semesters/:id
export const getSemesterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const semester = await prisma.semester.findUnique({
      where: { id }
    });
    
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    const semesterWithDisplayName = {
      ...semester,
      displayName: generateDisplayName(semester.termNumber, semester.isSupplementary)
    };
    
    res.json({ data: semesterWithDisplayName });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/semesters
export const createSemester = async (req, res, next) => {
  try {
    const validatedData = createSemesterSchema.parse(req.body);
    
    // Check for existing semester with same term and academic year
    const existingSemester = await prisma.semester.findUnique({
      where: { 
        academicYear_termNumber_isSupplementary: {
          academicYear: validatedData.academicYear,
          termNumber: validatedData.termNumber,
          isSupplementary: validatedData.isSupplementary
        }
      }
    });
    
    if (existingSemester) {
      const displayName = generateDisplayName(validatedData.termNumber, validatedData.isSupplementary);
      return res.status(400).json({ 
        message: `Semester "${displayName}" already exists in academic year ${validatedData.academicYear}` 
      });
    }
    
    // Check date conflicts
    const dateConflict = await checkDateConflicts(
      validatedData.startDate, 
      validatedData.endDate
    );
    
    if (dateConflict.conflict) {
      return res.status(400).json({ message: dateConflict.message });
    }
    
    const newSemester = await prisma.semester.create({
      data: {
        ...validatedData,
        id: uuidv7()
      }
    });
    
    res.status(201).json({ data: newSemester.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/semesters/:id
export const updateSemester = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateSemesterSchema.parse(req.body);
    
    const semester = await prisma.semester.findUnique({
      where: { id }
    });
    
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    // Additional date range validation for updates
    if (validatedData.startDate || validatedData.endDate) {
      const checkStartDate = validatedData.startDate || semester.startDate;
      const checkEndDate = validatedData.endDate || semester.endDate;
      
      // Check if end date is at least 60 days after start date
      const start = new Date(checkStartDate);
      const end = new Date(checkEndDate);
      const diffInMs = end.getTime() - start.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      if (diffInDays < 60) {
        return res.status(400).json({ 
          message: 'End date must be at least 60 days after start date' 
        });
      }
      
      // Simplified check: dates should be within the academic year (general year range)
      const academicYear = validatedData.academicYear || semester.academicYear;
      const [startYear, endYear] = academicYear.split('-').map(Number);
      
      if (start.getFullYear() < startYear || start.getFullYear() > endYear) {
        return res.status(400).json({ 
          message: 'Start date must be within the academic year' 
        });
      }
      
      if (end.getFullYear() < startYear || end.getFullYear() > endYear) {
        return res.status(400).json({ 
          message: 'End date must be within the academic year' 
        });
      }
    }
    
    // Check for term and academic year uniqueness if being updated
    if (validatedData.termNumber !== undefined || validatedData.isSupplementary !== undefined || validatedData.academicYear) {
      const checkTermNumber = validatedData.termNumber !== undefined ? validatedData.termNumber : semester.termNumber;
      const checkIsSupplementary = validatedData.isSupplementary !== undefined ? validatedData.isSupplementary : semester.isSupplementary;
      const checkYear = validatedData.academicYear || semester.academicYear;
      
      const existingSemester = await prisma.semester.findFirst({
        where: { 
          academicYear: checkYear,
          termNumber: checkTermNumber,
          isSupplementary: checkIsSupplementary,
          id: { not: id }
        }
      });
      
      if (existingSemester) {
        const displayName = generateDisplayName(checkTermNumber, checkIsSupplementary);
        return res.status(400).json({ 
          message: `Semester "${displayName}" already exists in academic year ${checkYear}` 
        });
      }
    }
    
    // Check date conflicts if dates are being updated
    if (validatedData.startDate || validatedData.endDate) {
      const checkStartDate = validatedData.startDate || semester.startDate;
      const checkEndDate = validatedData.endDate || semester.endDate;
      
      const dateConflict = await checkDateConflicts(
        checkStartDate, 
        checkEndDate, 
        id
      );
      
      if (dateConflict.conflict) {
        return res.status(400).json({ message: dateConflict.message });
      }
    }
    
    const updatedSemester = await prisma.semester.update({
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

// [DELETE] /api/semesters/:id  
export const deleteSemester = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const semester = await prisma.semester.findUnique({
      where: { id }
    });
    
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    // TODO: Check if semester is being used in course classes when that feature is implemented
    // For now, we allow deletion
    
    await prisma.semester.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true }); 
  } catch (error) {
    next(error);
  }
}; 