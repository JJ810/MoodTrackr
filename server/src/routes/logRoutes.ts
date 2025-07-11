import express from 'express';
import {
    createLog,
    getLogs,
    getLogById,
    updateLog,
    deleteLog,
    getLogsSummary
} from '../controllers/logController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createLog);
router.get('/', getLogs);
router.get('/summary', getLogsSummary);
router.get('/:id', getLogById);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

export default router;
