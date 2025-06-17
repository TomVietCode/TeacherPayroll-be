import { Router } from 'express';
import {
  getAllCourseClasses,
  getCourseClassById,
  createCourseClasses,
  updateCourseClass,
  deleteCourseClass,
  getCourseClassesBySemester,
  getCourseClassesByTeacherAndSemester
} from '../controllers/courseClassController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Course class routes
router.get('/', getAllCourseClasses);
router.get('/by-semester/:semesterId', getCourseClassesBySemester);
router.get('/by-teacher/:teacherId/semester/:semesterId', getCourseClassesByTeacherAndSemester);
router.get('/:id', getCourseClassById);
router.post('/', requireRole('ADMIN', 'FACULTY_MANAGER'), createCourseClasses);
router.patch('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateCourseClass);
router.delete('/:id', requireRole('ADMIN', 'FACULTY_MANAGER'), deleteCourseClass);

export default router; 