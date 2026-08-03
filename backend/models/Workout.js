import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a workout title'],
      trim: true,
    },
    load: {
      type: Number,
      required: [true, 'Please add a load/weight (kg or lbs)'],
      min: [0, 'Load cannot be negative'],
    },
    reps: {
      type: Number,
      required: [true, 'Please add number of repetitions'],
      min: [1, 'Reps must be at least 1'],
    },
    duration: {
      type: Number,
      required: [true, 'Please add duration in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
