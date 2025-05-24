import express from 'express';
import {
  getAllCourseClasses,
  getCourseClassById,
  createCourseClasses,
  updateCourseClass,
  deleteCourseClass,
  getCourseClassesBySemester
} from '../controllers/courseClassController.js';

const router = express.Router();

// Course class routes
router.get('/', getAllCourseClasses);
router.get('/by-semester/:semesterId', getCourseClassesBySemester);
router.get('/:id', getCourseClassById);
router.post('/', createCourseClasses);
router.patch('/:id', updateCourseClass);
router.delete('/:id', deleteCourseClass);

export default router; 