import express from 'express';
import {
  checkIn,
  checkOut,
  checkOutSelf,
  getQrToken,
  getSelfStatus,
  scanCheckIn,
  getMemberAttendanceHistory,
  getGymAttendanceByDate,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

router.post('/check-in', authorize('owner', 'trainer'), checkIn);
router.put('/check-out', authorize('owner', 'trainer'), checkOut);
router.post('/scan', authorize('owner', 'trainer'), scanCheckIn);
router.put('/check-out-self', authorize('member'), checkOutSelf);
router.get('/status-self', authorize('member'), getSelfStatus);
router.get('/qr-token', getQrToken);
router.get('/member/:member_id', getMemberAttendanceHistory);
router.get('/gym/:gym_id', getGymAttendanceByDate);

export default router;
