import express from 'express';
import {
  getAllHourlyRates,
  getHourlyRateById,
  getHourlyRateByAcademicYear,
  createHourlyRate,
  updateHourlyRate,
  deleteHourlyRate
} from '../controllers/hourlyRateController.js';

const router = express.Router();

router.get('/', getAllHourlyRates);
router.get('/:id', getHourlyRateById);
router.get('/academic-year/:academicYear', getHourlyRateByAcademicYear);
router.post('/', createHourlyRate);
router.patch('/:id', updateHourlyRate);
router.delete('/:id', deleteHourlyRate);

export default router; 