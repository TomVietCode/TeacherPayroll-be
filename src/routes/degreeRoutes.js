import express from 'express';
import { getAllDegrees, getDegreeById, createDegree, updateDegree, deleteDegree } from '../controllers/degreeController.js';

const router = express.Router();

router.get('/', getAllDegrees);
router.get('/:id', getDegreeById);
router.post('/', createDegree);
router.patch('/:id', updateDegree);
router.delete('/:id', deleteDegree);

export default router; 