import express from 'express';
import {
  getTeachersByDepartment,
  getTeachersByDegree,
  getTeachersByAge,
  getStatisticsSummary,
  exportTeachersByDepartment,
  exportTeachersByDegree,
  exportTeachersByAge,
  exportStatisticsSummary
} from '../controllers/statisticsController.js';

const router = express.Router();

// Statistics routes - JSON API
router.get('/by-department', getTeachersByDepartment);
router.get('/by-degree', getTeachersByDegree);
router.get('/by-age', getTeachersByAge);
router.get('/summary', getStatisticsSummary);

// Excel export routes
router.get('/by-department/export', exportTeachersByDepartment);
router.get('/by-degree/export', exportTeachersByDegree);
router.get('/by-age/export', exportTeachersByAge);
router.get('/summary/export', exportStatisticsSummary);

export default router; 