import Member from '../models/Member.js';
import Badge from '../models/Badge.js';
import { computeStreaks, getMonthlyCheckInDayCount } from '../utils/streakUtils.js';

// @desc    The requesting member's current and longest attendance streak.
// @route   GET /api/gamification/streak-self
// @access  Private (member, for their own streak)
export const getMyStreak = async (req, res) => {
  try {
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('No member profile found for this account');
    }

    const { currentStreak, longestStreak } = await computeStreaks(member._id);
    res.json({ currentStreak, longestStreak });
  } catch (error) {
    res.status(res.statusCode !== 200 ? res.statusCode : 500).json({ message: error.message });
  }
};

// @desc    Badges the requesting member has earned so far.
// @route   GET /api/gamification/badges-self
// @access  Private (member, for their own badges)
export const getMyBadges = async (req, res) => {
  try {
    const member = await Member.findOne({ user_id: req.user.id });
    if (!member) {
      res.status(404);
      throw new Error('No member profile found for this account');
    }

    const badges = await Badge.find({ member_id: member._id }).sort({ awarded_date: -1 });
    res.json(badges);
  } catch (error) {
    res.status(res.statusCode !== 200 ? res.statusCode : 500).json({ message: error.message });
  }
};

// @desc    This month's attendance leaderboard for a gym, ranked by number of
//          distinct check-in days, with each member's current streak and
//          highest-tier badge for context.
// @route   GET /api/gamification/leaderboard/:gym_id
// @access  Private (any role, own gym only)
export const getLeaderboard = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (gym_id.toString() !== req.user.gym_id.toString()) {
      res.status(403);
      throw new Error("Forbidden: Cannot view another gym's leaderboard");
    }

    const members = await Member.find({ gym_id, status: 'active' }).populate({
      path: 'user_id',
      select: 'name',
    });

    const leaderboard = await Promise.all(
      members.map(async (member) => {
        const [monthlyCheckIns, { currentStreak }, topBadge] = await Promise.all([
          getMonthlyCheckInDayCount(member._id),
          computeStreaks(member._id),
          Badge.findOne({ member_id: member._id }).sort({ streak_days: -1 }),
        ]);

        return {
          member_id: member._id,
          name: member.user_id?.name || 'Member',
          monthlyCheckIns,
          currentStreak,
          topBadge: topBadge ? { emoji: topBadge.emoji, label: topBadge.label } : null,
        };
      })
    );

    leaderboard.sort((a, b) => b.monthlyCheckIns - a.monthlyCheckIns || b.currentStreak - a.currentStreak);
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(error.statusCode || res.statusCode || 500).json({ message: error.message });
  }
};
