import { z } from 'zod';

// Base schema for date validation
const dateSchema = z.string()
  .datetime({ message: 'Invalid date format' })
  .refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date value');
const baseSemesterSchema = z.object({
  termNumber: z.number()
    .int('Term number must be an integer')
    .min(1, 'Term number must be at least 1')
    .max(3, 'Term number cannot exceed 3'),
  isSupplementary: z.boolean().default(false),
  academicYear: z.string()
    .min(1, 'Academic year is required')
    .max(20, 'Academic year cannot exceed 20 characters')
    .regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY')
    .refine((yearStr) => {
      const [startYear, endYear] = yearStr.split('-').map(Number);
      const currentYear = new Date().getFullYear();
      
      // Start year cannot be in the past
      if (startYear < currentYear) {
        return false;
      }
      
      // End year must be exactly 1 year after start year
      if (endYear !== startYear + 1) {
        return false;
      }
      
      return true;
    }, 'Start year cannot be in the past and end year must be exactly 1 year after start year'),
  startDate: dateSchema,
  endDate: dateSchema
});

// Create schema with comprehensive validation
export const createSemesterSchema = baseSemesterSchema.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  // Check if duration is at least 60 days
  if (diffInDays < 60) {
    return false;
  }
  
  // Simplified check: dates should be within the academic year (general year range)
  const [startYear, endYear] = data.academicYear.split('-').map(Number);
  
  if (start.getFullYear() < startYear || start.getFullYear() > endYear) {
    return false;
  }
  
  if (end.getFullYear() < startYear || end.getFullYear() > endYear) {
    return false;
  }
  
  return true;
}, {
  message: 'End date must be at least 60 days after start date and both dates must be within the academic year',
  path: ['endDate']
});

// Update schema with partial validation
export const updateSemesterSchema = baseSemesterSchema.partial(); 