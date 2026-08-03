import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link class to a gym branch'],
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a trainer user'],
    },
    class_name: {
      type: String,
      required: [true, 'Please add a class name'],
      trim: true,
    },
    schedule_time: {
      type: Date,
      required: [true, 'Please set a schedule date/time'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please set session capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model('Class', classSchema);
export default Class;
