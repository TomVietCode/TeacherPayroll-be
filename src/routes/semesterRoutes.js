import express from 'express';
import { getAllSemesters, getSemesterById, createSemester, updateSemester, deleteSemester, getAcademicYears } from '../controllers/semesterController.js';

const router = express.Router();

router.get('/', getAllSemesters);
router.get('/academic-years', getAcademicYears);
router.get('/:id', getSemesterById);
router.post('/', createSemester);
router.patch('/:id', updateSemester);
router.delete('/:id', deleteSemester);

export default router; 