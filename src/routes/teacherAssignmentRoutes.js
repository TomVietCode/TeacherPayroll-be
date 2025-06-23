import express from 'express';
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  bulkAssignment,
  updateAssignment,
  deleteAssignment,
  getUnassignedClasses,
  getAllClassesForAssignment,
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

// Helper endpoints for bulk assignment
router.get('/unassigned/classes', getUnassignedClasses);
router.get('/all/classes', getAllClassesForAssignment);
router.get('/teacher/:teacherId/workload', getTeacherWorkload);

export default router; 