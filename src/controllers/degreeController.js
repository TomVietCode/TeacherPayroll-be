import { PrismaClient } from '@prisma/client';
import { createDegreeSchema, updateDegreeSchema } from '../validators/degreeValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// [GET] /api/degrees
export const getAllDegrees = async (req, res, next) => {
  try {
    const degrees = await prisma.degree.findMany({
      orderBy: { fullName: 'asc' }
    });
    res.json({ data: degrees });
  } catch (error) {
    next(error); 
  }
};

// [GET] /api/degrees/:id
export const getDegreeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const degree = await prisma.degree.findUnique({
      where: { id }
    });
    
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }
    
    res.json({ data: degree });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/degrees
export const createDegree = async (req, res, next) => {
  try {
    const validatedData = createDegreeSchema.parse(req.body);
    
    const existingDegree = await prisma.degree.findUnique({
      where: { shortName: validatedData.shortName }
    });
    
    if (existingDegree) {
      return res.status(400).json({ message: 'Short name is already in use' });
    }
    
    const newDegree = await prisma.degree.create({
      data: {
        ...validatedData,
        id: uuidv7() // Generate UUID v7
      }
    });
    
    res.status(201).json({ data: newDegree.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};

// [PATCH] /api/degrees/:id
export const updateDegree = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateDegreeSchema.parse(req.body);
    
    const degree = await prisma.degree.findUnique({
      where: { id }
    });
    
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }
    
    if (validatedData.shortName) {
      const existingDegree = await prisma.degree.findFirst({
        where: { 
          shortName: validatedData.shortName,
          id: { not: id } 
        }
      });
      
      if (existingDegree) {
        return res.status(400).json({ message: 'Short name is already in use' });
      }
    }
    
    const updatedDegree = await prisma.degree.update({
      where: { id },
      data: validatedData
    });
    
    res.json({ data: true });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};

// [DELETE] /api/degrees/:id  
export const deleteDegree = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const degree = await prisma.degree.findUnique({
      where: { id }
    });
    
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found' });
    }
    
    const teachersWithDegree = await prisma.teacher.count({
      where: { degreeId: id }
    });
    
    if (teachersWithDegree > 0) {
      return res.status(400).json({ message: 'Cannot delete because the degree is being used by teachers' });
    }
    
    await prisma.degree.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true }); 
  } catch (error) {
    next(error);
  }
}; 