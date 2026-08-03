import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please link member to a user profile'],
      unique: true,
    },
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link member to a gym'],
    },
    membership_plan: {
      type: String,
      trim: true,
      default: null,
    },
    join_date: {
      type: Date,
      default: Date.now,
    },
    expiry_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'pending_approval', 'rejected'],
      default: 'pending_approval',
    },
    assigned_trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assigned_dietitian_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejection_reason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model('Member', memberSchema);
export default Member;
