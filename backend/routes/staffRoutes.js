import express from 'express';
import {
  createTrainer,
  getTrainers,
  updateTrainer,
  deleteTrainer,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .post(authorize('owner'), createTrainer);

router.route('/gym/:gym_id')
  .get(authorize('owner', 'trainer'), getTrainers);

router.route('/:id')
  .put(authorize('owner'), updateTrainer)
  .delete(authorize('owner'), deleteTrainer);

export default router;
