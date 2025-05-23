import express from 'express';
import { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';

const router = express.Router();

router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);
router.post('/', createSubject);
router.patch('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router; 