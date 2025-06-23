import express from 'express';
import {
  getTeacherYearlyPayrollReport,
  getDepartmentPayrollReport,
  getSchoolPayrollReport,
  exportTeacherYearlyPayrollReport,
  exportDepartmentPayrollReport,
  exportSchoolPayrollReport
} from '../controllers/reportController.js';

const router = express.Router();



// Regular report routes
router.get('/teacher/:teacherId/yearly/:academicYear', getTeacherYearlyPayrollReport);
router.get('/department/:departmentId/yearly/:academicYear', getDepartmentPayrollReport);
router.get('/school/yearly/:academicYear', getSchoolPayrollReport);

// Excel export routes
router.get('/teacher/:teacherId/yearly/:academicYear/export', exportTeacherYearlyPayrollReport);
router.get('/department/:departmentId/yearly/:academicYear/export', exportDepartmentPayrollReport);
router.get('/school/yearly/:academicYear/export', exportSchoolPayrollReport);

export default router; 