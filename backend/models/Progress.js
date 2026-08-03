import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
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
    weight: {
      type: Number,
      required: [true, 'Please add body weight progress (kg)'],
      min: [0, 'Weight cannot be negative'],
    },
    measurements: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    recorded_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
