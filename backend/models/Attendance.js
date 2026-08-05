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

// Enforces at most one open (check_out_time: null) session per member at the DB level,
// closing the read-then-write race in checkIn's app-level duplicate check.
attendanceSchema.index(
  { member_id: 1, check_out_time: 1 },
  { unique: true, partialFilterExpression: { check_out_time: null } }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
