import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema(
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
    meal_name: {
      type: String,
      required: [true, 'Please add a meal name'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Please set calories count'],
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
    day_of_week: {
      type: String,
      default: 'Monday',
      trim: true,
    },
    day_subtitle: {
      type: String,
      default: '',
      trim: true,
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

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
