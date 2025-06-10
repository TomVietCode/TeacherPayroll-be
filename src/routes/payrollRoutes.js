import express from 'express';
import {
  calculatePayroll,
  getAcademicYearsWithPayrollData
} from '../controllers/payrollController.js';

const router = express.Router();

router.post('/calculate', calculatePayroll);
router.get('/academic-years', getAcademicYearsWithPayrollData);

export default router; 