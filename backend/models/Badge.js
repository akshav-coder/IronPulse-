import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Please link badge to a member'],
    },
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link badge to a gym'],
    },
    badge_key: {
      type: String,
      required: [true, 'Please add a badge key'],
    },
    label: {
      type: String,
      required: [true, 'Please add a badge label'],
    },
    emoji: {
      type: String,
      required: [true, 'Please add a badge emoji'],
    },
    streak_days: {
      type: Number,
      required: [true, 'Please add the streak length this badge represents'],
    },
    awarded_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevents the same member from earning the same badge twice; also makes
// cron-job re-runs idempotent (duplicate awards fail via this index instead
// of needing a separate existence check).
badgeSchema.index({ member_id: 1, badge_key: 1 }, { unique: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
