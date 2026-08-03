import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please link booking to a class session'],
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Please link booking to a member profile'],
    },
    booking_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    attended: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a member can only book a class session once
bookingSchema.index({ class_id: 1, member_id: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
