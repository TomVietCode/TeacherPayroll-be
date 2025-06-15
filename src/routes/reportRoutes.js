import express from 'express';
import {
  getTeacherYearlyPayrollReport,
  getDepartmentPayrollReport,
  getSchoolPayrollReport
} from '../controllers/reportController.js';

const router = express.Router();

// UC4.1: Báo cáo tiền dạy của giáo viên trong một năm
router.get('/teacher/:teacherId/academic-year/:academicYear', getTeacherYearlyPayrollReport);

// UC4.2: Báo cáo tiền dạy của giáo viên một khoa
router.get('/department/:departmentId/academic-year/:academicYear', getDepartmentPayrollReport);

// UC4.3: Báo cáo tiền dạy của giáo viên toàn trường
router.get('/school/academic-year/:academicYear', getSchoolPayrollReport);

export default router; 