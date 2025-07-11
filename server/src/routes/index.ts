import express from 'express';
import authRoutes from './authRoutes';
import logRoutes from './logRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/logs', logRoutes);

export default router;
