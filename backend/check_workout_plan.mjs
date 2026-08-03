import mongoose from 'mongoose';
import User from './models/User.js';
import Member from './models/Member.js';
import WorkoutPlan from './models/WorkoutPlan.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const members = await Member.find({}).populate('user_id');
  console.log('Members count:', members.length);
  for (const m of members) {
    console.log(`Member ID: ${m._id}, Name: ${m.user_id?.name}, Trainer: ${m.assigned_trainer_id}, Dietitian: ${m.assigned_dietitian_id}`);
    const plans = await WorkoutPlan.find({ member_id: m._id });
    console.log(`-> Workout plan items count: ${plans.length}`);
    for (const p of plans) {
      console.log(`   - Exercise: ${p.exercise_name}, Day: ${p.day_of_week}, Subtitle: ${p.day_subtitle}`);
    }
  }

  await mongoose.disconnect();
};

run();
