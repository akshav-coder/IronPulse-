import express from 'express';
import {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// User notification routes
router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Manual notification creation (restricted to trainer or owner)
router.post('/', authorize('owner', 'trainer'), createNotification);

export default router;
