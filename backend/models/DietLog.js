import mongoose from 'mongoose';

const dietLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a meal title'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Please add calories count'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      default: 0,
      min: [0, 'Carbs cannot be negative'],
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative'],
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const DietLog = mongoose.model('DietLog', dietLogSchema);
export default DietLog;
