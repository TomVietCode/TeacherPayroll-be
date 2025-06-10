import { PrismaClient } from '@prisma/client';
import { createHourlyRateSchema, updateHourlyRateSchema } from '../validators/hourlyRateValidator.js';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// [GET] /api/hourly-rates
export const getAllHourlyRates = async (req, res, next) => {
  try {
    const hourlyRates = await prisma.hourlyRate.findMany({
      orderBy: { academicYear: 'desc' }
    });
    res.json({ data: hourlyRates });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/hourly-rates/:id
export const getHourlyRateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hourlyRate = await prisma.hourlyRate.findUnique({
      where: { id }
    });
    
    if (!hourlyRate) {
      return res.status(404).json({ message: 'Định mức tiền theo tiết không tìm thấy' });
    }
    
    res.json({ data: hourlyRate });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/hourly-rates/academic-year/:academicYear
export const getHourlyRateByAcademicYear = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const hourlyRate = await prisma.hourlyRate.findUnique({
      where: { academicYear }
    });
    
    if (!hourlyRate) {
      return res.status(404).json({ message: 'Không tìm thấy định mức tiền cho năm học này' });
    }
    
    res.json({ data: hourlyRate });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/hourly-rates
export const createHourlyRate = async (req, res, next) => {
  try {
    const validatedData = createHourlyRateSchema.parse(req.body);
    
    // Check if academic year already exists
    const existingRate = await prisma.hourlyRate.findUnique({
      where: { academicYear: validatedData.academicYear }
    });
    
    if (existingRate) {
      return res.status(400).json({ message: 'Năm học đã có định mức, vui lòng chọn năm khác' });
    }
    
    const newHourlyRate = await prisma.hourlyRate.create({
      data: {
        ...validatedData,
        id: uuidv7()
      }
    });
    
    res.status(201).json({ data: newHourlyRate.id });
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const errorMessage = firstError.message || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }
    next(error);
  }
};

// [PATCH] /api/hourly-rates/:id
export const updateHourlyRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateHourlyRateSchema.parse(req.body);
    
    const hourlyRate = await prisma.hourlyRate.findUnique({
      where: { id }
    });
    
    if (!hourlyRate) {
      return res.status(404).json({ message: 'Định mức tiền theo tiết không tìm thấy' });
    }
    
    const updatedHourlyRate = await prisma.hourlyRate.update({
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

// [DELETE] /api/hourly-rates/:id
export const deleteHourlyRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hourlyRate = await prisma.hourlyRate.findUnique({
      where: { id }
    });
    
    if (!hourlyRate) {
      return res.status(404).json({ message: 'Định mức tiền theo tiết không tìm thấy' });
    }
    
    // TODO: Check if hourly rate is being used in salary calculations
    // This would require checking payroll records if they exist
    
    await prisma.hourlyRate.delete({
      where: { id }
    });
    
    res.json({ data: true });
  } catch (error) {
    next(error);
  }
}; 