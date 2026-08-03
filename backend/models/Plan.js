import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link plan to a gym branch'],
    },
    name: {
      type: String,
      required: [true, 'Please add a plan name'],
      trim: true,
    },
    duration_days: {
      type: Number,
      required: [true, 'Please set plan duration in days'],
      min: [1, 'Duration must be at least 1 day'],
    },
    price: {
      type: Number,
      required: [true, 'Please set a price'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
