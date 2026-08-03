import express from 'express';
import {
  getOwnerDashboardMetrics,
  getOwnerRevenueReport,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection and owner role restrictions
router.use(protect);
router.use(authorize('owner'));

// Owner dashboard metrics
router.get('/owner/:gym_id', getOwnerDashboardMetrics);

// Owner revenue ledger details
router.get('/owner-revenue/report', getOwnerRevenueReport);

export default router;
