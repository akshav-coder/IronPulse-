import express from 'express';
import {
  addProgressEntry,
  getProgressHistory,
} from '../controllers/progressController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Get progress history (accessible by member themselves, or assigned trainer/owner)
router.get('/member/:member_id', getProgressHistory);

// Add progress entry (Trainer only)
router.post('/', authorize('trainer'), addProgressEntry);

export default router;
