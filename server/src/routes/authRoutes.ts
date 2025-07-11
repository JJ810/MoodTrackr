import express from 'express';
import { googleLogin, getUser } from '../controllers/authController';
import { authenticateToken } from '../middleware';

const router = express.Router();

router.post('/google', googleLogin);

// Get user information (protected route)
router.get('/user', authenticateToken, getUser);

export default router;
