import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link message to a gym branch'],
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify the sender user'],
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify the receiver user'],
    },
    message_text: {
      type: String,
      required: [true, 'Message text cannot be empty'],
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

const Message = mongoose.model('Message', messageSchema);
export default Message;
