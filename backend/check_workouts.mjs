import mongoose from 'mongoose';
import User from './models/User.js';
import Member from './models/Member.js';
import Workout from './models/Workout.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const workouts = await Workout.find({}).populate('user');
  console.log('Total Workouts count:', workouts.length);
  for (const w of workouts) {
    console.log(`Workout ID: ${w._id}, Title: ${w.title}, User: ${w.user?.name} (${w.user?.role}, ID: ${w.user?._id})`);
  }

  await mongoose.disconnect();
};

run();
