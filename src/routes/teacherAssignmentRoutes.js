import express from 'express';
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  bulkAssignment,
  quickAssignment,
  updateAssignment,
  deleteAssignment,
  getUnassignedClasses,
  getTeacherWorkload
} from '../controllers/teacherAssignmentController.js';

const router = express.Router();

// Basic CRUD operations
router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.patch('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

// Optimized assignment operations
router.post('/bulk', bulkAssignment);
router.post('/quick', quickAssignment);

// Helper endpoints for quick assignment
router.get('/unassigned/classes', getUnassignedClasses);
router.get('/teacher/:teacherId/workload', getTeacherWorkload);

export default router; 