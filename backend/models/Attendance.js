import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Please link attendance log to a member'],
    },
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link attendance log to a gym'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Please add a date'],
    },
    check_in_time: {
      type: Date,
      required: [true, 'Please add check-in time'],
    },
    check_out_time: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance for the same member on the same day
// Wait, we can keep it flexible or index it if needed. Let's keep the schema simple and robust.

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
