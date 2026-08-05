// Streak milestones, ordered ascending. A member becomes eligible for every
// tier at or below their current streak (checked via a unique index so
// re-awarding an already-earned badge is a no-op, not an error).
export const BADGE_DEFINITIONS = [
  { key: 'streak_3', days: 3, label: '3-Day Streak', emoji: '🔥' },
  { key: 'streak_7', days: 7, label: 'Week Warrior', emoji: '⚡' },
  { key: 'streak_14', days: 14, label: 'Two-Week Titan', emoji: '💪' },
  { key: 'streak_30', days: 30, label: 'Monthly Master', emoji: '🏆' },
  { key: 'streak_60', days: 60, label: '60-Day Legend', emoji: '👑' },
  { key: 'streak_100', days: 100, label: 'Century Club', emoji: '💯' },
];
