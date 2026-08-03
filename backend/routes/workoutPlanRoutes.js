import express from 'express';
import {
  addWorkoutPlanItem,
  updateWorkoutPlanItem,
  deleteWorkoutPlanItem,
  getMemberWorkoutPlan,
  assignBulkWorkoutPlan,
} from '../controllers/workoutPlanController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// Member and Trainer/Owner view route
router.get('/member/:member_id', getMemberWorkoutPlan);

// Trainer/Owner management routes
router.post('/assign-bulk', authorize('owner', 'trainer'), assignBulkWorkoutPlan);
router.post('/', authorize('owner', 'trainer'), addWorkoutPlanItem);
router.put('/:id', authorize('owner', 'trainer'), updateWorkoutPlanItem);
router.delete('/:id', authorize('owner', 'trainer'), deleteWorkoutPlanItem);

export default router;
