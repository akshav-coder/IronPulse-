import express from 'express';
import { getMyStreak, getMyBadges, getLeaderboard } from '../controllers/gamificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/streak-self', getMyStreak);
router.get('/badges-self', getMyBadges);
router.get('/leaderboard/:gym_id', getLeaderboard);

export default router;
