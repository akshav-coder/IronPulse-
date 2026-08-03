import mongoose from 'mongoose';

const workoutPlanSchema = new mongoose.Schema(
  {
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Please link to a member profile'],
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a trainer user'],
    },
    exercise_name: {
      type: String,
      required: [true, 'Please add an exercise name'],
      trim: true,
    },
    sets: {
      type: Number,
      required: [true, 'Please set sets count'],
      min: [1, 'Sets must be at least 1'],
    },
    reps: {
      type: Number,
      required: [true, 'Please set reps count'],
      min: [1, 'Reps must be at least 1'],
    },
    day_of_week: {
      type: String,
      default: 'Monday',
      trim: true,
    },
    day_subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    created_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
export default WorkoutPlan;
