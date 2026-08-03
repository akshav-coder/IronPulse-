import express from 'express';
import {
  createPayment,
  getMemberPaymentHistory,
  getGymPayments,
  updatePaymentStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook route - public (Razorpay calls this directly without auth headers)
router.post('/razorpay/webhook', razorpayWebhook);

// Apply auth protection to subsequent endpoints
router.use(protect);

router.post('/', createPayment);
router.get('/member/:member_id', getMemberPaymentHistory);
router.get('/gym/:gym_id', getGymPayments);
router.put('/:id/status', updatePaymentStatus);

// Razorpay checkout endpoints
router.post('/:id/razorpay-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
