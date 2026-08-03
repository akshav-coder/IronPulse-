import express from 'express';
import {
  bookClass,
  cancelBooking,
  getGymClassesWithBookingStatus,
  toggleClassAttendance,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// Member booking routes
router.post('/', authorize('member'), bookClass);
router.post('/cancel', authorize('member'), cancelBooking);
router.get('/gym/:gym_id', authorize('member'), getGymClassesWithBookingStatus);

// Owner/Trainer attendance routes
router.put('/:id/attendance', authorize('owner', 'trainer'), toggleClassAttendance);

export default router;
