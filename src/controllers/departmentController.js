import { PrismaClient } from '@prisma/client';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/departmentValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// [GET] /api/departments
export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { fullName: 'asc' }
    });
    res.json({ data: departments });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/departments/:id
export const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id }
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json({ data: department });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/departments
export const createDepartment = async (req, res, next) => {
  try {
    const validatedData = createDepartmentSchema.parse(req.body);
    
    const existingDepartment = await prisma.department.findUnique({
      where: { shortName: validatedData.shortName }
    });
    
    if (existingDepartment) {
      return res.status(400).json({ message: 'Short name is already in use' });
    }
    
    const newDepartment = await prisma.department.create({
      data: {
        ...validatedData,
        id: uuidv7() // Generate UUID v7
      }
    });
    
    res.status(201).json({ data: newDepartment.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/departments/:id
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateDepartmentSchema.parse(req.body);
    
    const department = await prisma.department.findUnique({
      where: { id }
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    if (validatedData.shortName) {
      const existingDepartment = await prisma.department.findFirst({
        where: { 
          shortName: validatedData.shortName,
          id: { not: id }
        }
      });
      
      if (existingDepartment) {
        return res.status(400).json({ message: 'Short name is already in use' });
      }
    }
    
    const updatedDepartment = await prisma.department.update({
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

// [DELETE] /api/departments/:id
export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { id }
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const teachersWithDepartment = await prisma.teacher.count({
      where: { departmentId: id }
    });
    
    if (teachersWithDepartment > 0) {
      return res.status(400).json({ message: 'Cannot delete because the department has teachers' });
    }
    
    await prisma.department.delete({
      where: { id }
    });
    
    res.status(204).json({ data: true });
  } catch (error) {
    next(error);
  }
};

