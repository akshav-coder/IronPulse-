import express from 'express';
import {
  sendMessage,
  getConversation,
  markMessagesAsRead,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/conversation/:other_user_id', getConversation);
router.put('/read/:sender_id', markMessagesAsRead);

export default router;
