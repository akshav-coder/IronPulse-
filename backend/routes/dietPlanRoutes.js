import express from 'express';
import {
  addDietPlanItem,
  updateDietPlanItem,
  deleteDietPlanItem,
  getMemberDietPlan,
  assignBulkDietPlan,
} from '../controllers/dietPlanController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// Get diet plan (accessible by member themselves, or assigned trainer/owner)
router.get('/member/:member_id', getMemberDietPlan);

// Manage diet plan (Trainer and Owner only)
router.post('/assign-bulk', authorize('owner', 'trainer'), assignBulkDietPlan);
router.post('/', authorize('owner', 'trainer'), addDietPlanItem);
router.put('/:id', authorize('owner', 'trainer'), updateDietPlanItem);
router.delete('/:id', authorize('owner', 'trainer'), deleteDietPlanItem);

export default router;
