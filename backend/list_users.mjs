import mongoose from 'mongoose';
import User from './models/User.js';
import Member from './models/Member.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const users = await User.find({});
  console.log('USERS:');
  for (const u of users) {
    console.log(`- User ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
  }

  const members = await Member.find({});
  console.log('MEMBERS:');
  for (const m of members) {
    console.log(`- Member ID: ${m._id}, User Ref: ${m.user_id}, Gym: ${m.gym_id}`);
  }

  await mongoose.disconnect();
};

run();
