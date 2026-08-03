import mongoose from 'mongoose';
import Gym from './models/Gym.js';
import User from './models/User.js';
import Member from './models/Member.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // 1. Create or Find Gym
    let gym = await Gym.findOne({ name: 'Pulse Premium Fitness' });
    if (!gym) {
      gym = await Gym.create({
        name: 'Pulse Premium Fitness',
        address: '101 Strength Avenue, Metro City',
        phone: '555-829-3748',
        logo_url: '',
      });
      console.log('Gym created:', gym.name, gym._id);
    } else {
      console.log('Gym found:', gym.name, gym._id);
    }

    // 2. Define standard passwords
    const plainPassword = 'password123';

    // 3. Create Owners
    const ownersData = [
      { name: 'Arthur Pendragon', email: 'owner1@pulse.com', role: 'owner' },
      { name: 'Gwen Stacy', email: 'owner2@pulse.com', role: 'owner' },
      { name: 'Tony Stark', email: 'owner3@pulse.com', role: 'owner' },
    ];

    const owners = [];
    for (const data of ownersData) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          gym_id: gym._id,
          name: data.name,
          email: data.email,
          password_hash: plainPassword,
          role: data.role,
          phone: '555-001-0002',
        });
        console.log('Created Owner:', user.email);
      } else {
        console.log('Owner already exists:', user.email);
      }
      owners.push(user);
    }

    // 4. Create Trainers
    const trainersData = [
      { name: 'Diana Prince', email: 'trainer1@pulse.com', role: 'trainer' },
      { name: 'Bruce Wayne', email: 'trainer2@pulse.com', role: 'trainer' },
      { name: 'Clark Kent', email: 'trainer3@pulse.com', role: 'trainer' },
    ];

    const trainers = [];
    for (const data of trainersData) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          gym_id: gym._id,
          name: data.name,
          email: data.email,
          password_hash: plainPassword,
          role: data.role,
          phone: '555-002-0003',
        });
        console.log('Created Trainer:', user.email);
      } else {
        console.log('Trainer already exists:', user.email);
      }
      trainers.push(user);
    }

    // 5. Create Members and corresponding Member profiles
    const membersData = [
      { name: 'Peter Parker', email: 'member1@pulse.com', plan: 'Monthly Elite', trainer: trainers[0]._id },
      { name: 'Barry Allen', email: 'member2@pulse.com', plan: 'Yearly VIP', trainer: trainers[1]._id },
      { name: 'Wanda Maximoff', email: 'member3@pulse.com', plan: 'Weekly Basic', trainer: trainers[2]._id },
    ];

    for (const data of membersData) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          gym_id: gym._id,
          name: data.name,
          email: data.email,
          password_hash: plainPassword,
          role: 'member',
          phone: '555-003-0004',
        });
        console.log('Created User credentials for Member:', user.email);
      }

      let member = await Member.findOne({ user_id: user._id });
      if (!member) {
        member = await Member.create({
          user_id: user._id,
          gym_id: gym._id,
          membership_plan: data.plan,
          status: 'active',
          assigned_trainer_id: data.trainer,
          join_date: new Date(),
        });
        console.log('Created Member Profile for:', user.email);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
