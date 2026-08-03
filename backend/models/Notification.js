import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link to a gym'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify user recipient'],
    },
    message: {
      type: String,
      required: [true, 'Please add a notification message'],
      trim: true,
    },
    is_read: {
      type: Boolean,
      default: false,
      required: true,
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

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
