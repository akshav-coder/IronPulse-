import express from 'express';
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getMemberWorkouts,
} from '../controllers/workoutController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to protect all routes
router.use(protect);

router.get('/member/:member_id', authorize('owner', 'trainer'), getMemberWorkouts);

router.route('/')
  .get(getWorkouts)
  .post(authorize('owner', 'trainer', 'member'), createWorkout);

router.route('/:id')
  .put(authorize('owner', 'trainer', 'member'), updateWorkout)
  .delete(authorize('owner', 'trainer', 'member'), deleteWorkout);

export default router;
