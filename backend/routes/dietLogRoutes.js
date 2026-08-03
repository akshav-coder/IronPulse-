import express from 'express';
import {
  getDietLogs,
  createDietLog,
  deleteDietLog,
} from '../controllers/dietLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDietLogs)
  .post(authorize('owner', 'trainer', 'member'), createDietLog);

router.route('/:id')
  .delete(authorize('owner', 'trainer', 'member'), deleteDietLog);

export default router;
