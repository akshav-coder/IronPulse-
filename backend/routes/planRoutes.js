import express from 'express';
import {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('owner'), createPlan)
  .get(getPlans);

router.route('/:id')
  .put(authorize('owner'), updatePlan)
  .delete(authorize('owner'), deletePlan);

export default router;
