import express from 'express';
import {
  createClass,
  getClasses,
  updateClass,
  deleteClass,
  getTrainerClasses,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Trainer routes
router.get('/trainer/me', authorize('trainer'), getTrainerClasses);

// Owner routes
router.post('/', authorize('owner'), createClass);
router.get('/gym/:gym_id', authorize('owner'), getClasses);
router.put('/:id', authorize('owner'), updateClass);
router.delete('/:id', authorize('owner'), deleteClass);

export default router;
