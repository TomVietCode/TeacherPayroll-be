import express from 'express';
import {
  getAllClassCoefficients,
  getClassCoefficientById,
  getClassCoefficientByAcademicYear,
  createClassCoefficient,
  updateClassCoefficient,
  updateClassCoefficientByAcademicYear,
  deleteClassCoefficient,
  getValidStudentRanges
} from '../controllers/classCoefficientController.js';

const router = express.Router();

router.get('/', getAllClassCoefficients);
router.get('/ranges', getValidStudentRanges);
router.get('/:id', getClassCoefficientById);
router.get('/academic-year/:academicYear', getClassCoefficientByAcademicYear);
router.post('/', createClassCoefficient);
router.patch('/:id', updateClassCoefficient);
router.patch('/academic-year/:academicYear', updateClassCoefficientByAcademicYear);
router.delete('/:id', deleteClassCoefficient);

export default router; 