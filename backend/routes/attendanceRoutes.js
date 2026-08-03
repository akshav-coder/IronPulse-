import express from 'express';
import {
  checkIn,
  checkOut,
  getMemberAttendanceHistory,
  getGymAttendanceByDate,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/member/:member_id', getMemberAttendanceHistory);
router.get('/gym/:gym_id', getGymAttendanceByDate);

export default router;
