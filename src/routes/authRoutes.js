import express from 'express';
import {
  login,
  logout,
  getCurrentUser,
  changePassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);
router.patch('/change-password', authenticateToken, changePassword);

export default router; 