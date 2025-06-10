import express from 'express';
import {
  getAllTeacherCoefficients,
  getTeacherCoefficientsByAcademicYear,
  createTeacherCoefficient,
  batchUpdateTeacherCoefficients,
  updateTeacherCoefficient,
  deleteTeacherCoefficient
} from '../controllers/teacherCoefficientController.js';

const router = express.Router();

router.get('/', getAllTeacherCoefficients);
router.get('/academic-year/:academicYear', getTeacherCoefficientsByAcademicYear);
router.post('/', createTeacherCoefficient);
router.patch('/batch', batchUpdateTeacherCoefficients);
router.patch('/:id', updateTeacherCoefficient);
router.delete('/:id', deleteTeacherCoefficient);

export default router; 