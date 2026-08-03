/**
 * SEED SCRIPT FOR IRONPULSE GYM APPLICATION
 * 
 * Execution Command:
 *   Option A: npm run seed (run from within the backend/ folder)
 *   Option B: node seed.js (run from within the backend/ folder)
 */

import mongoose from 'mongoose';
import Gym from './models/Gym.js';
import User from './models/User.js';
import Member from './models/Member.js';
import Payment from './models/Payment.js';
import Class from './models/Class.js';
import Post from './models/Post.js';
import WorkoutPlan from './models/WorkoutPlan.js';
import DietPlan from './models/DietPlan.js';
import Plan from './models/Plan.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // 1. Clear Existing Collections to Ensure Clean State
    console.log('Clearing existing database collections...');
    await Gym.deleteMany({});
    await User.deleteMany({});
    await Member.deleteMany({});
    await Payment.deleteMany({});
    await Class.deleteMany({});
    await Post.deleteMany({});
    await WorkoutPlan.deleteMany({});
    await DietPlan.deleteMany({});
    await Plan.deleteMany({});

    // 2. Create Gym
    const gym = await Gym.create({
      name: 'IronPulse Fitness Center',
      address: '101 Strength Avenue, Metro City',
      phone: '555-829-3748',
      logo_url: '',
    });
    console.log('Gym created:', gym.name, gym._id);

    // Default standard password for all seed accounts
    const plainPassword = 'password123';

    // 3. Create Owners
    const ownersData = [
      { name: 'Arthur Pendragon', email: 'owner1@ironpulse.com', phone: '555-101-0001' },
      { name: 'Tony Stark', email: 'owner2@ironpulse.com', phone: '555-101-0002' },
    ];

    const owners = [];
    for (const data of ownersData) {
      const user = await User.create({
        gym_id: gym._id,
        name: data.name,
        email: data.email,
        password_hash: plainPassword,
        role: 'owner',
        phone: data.phone,
      });
      owners.push(user);
      console.log('Created Owner:', user.email);
    }

    // 4. Create Trainers/Staff (At least 3 trainers/specialists)
    const trainersData = [
      { name: 'Diana Prince', email: 'trainer1@ironpulse.com', phone: '555-201-0001' },
      { name: 'Bruce Wayne', email: 'trainer2@ironpulse.com', phone: '555-201-0002' },
      { name: 'Clark Kent', email: 'trainer3@ironpulse.com', phone: '555-201-0003' },
    ];

    const trainers = [];
    for (const data of trainersData) {
      const user = await User.create({
        gym_id: gym._id,
        name: data.name,
        email: data.email,
        password_hash: plainPassword,
        role: 'trainer',
        phone: data.phone,
      });
      trainers.push(user);
      console.log('Created Trainer:', user.email);
    }

    // 5. Create Plans
    console.log('Seeding Plans...');
    const plansData = [
      { name: 'Weekly Basic', duration_days: 7, price: 500, description: 'Gym floor access, basic locker access' },
      { name: 'Monthly Elite', duration_days: 30, price: 2000, description: 'Gym floor access, cardio zone, 1 trainer consultation, group classes' },
      { name: 'Yearly VIP', duration_days: 365, price: 18000, description: 'Full access, free towel & locker, all group classes, steam room, personal trainer consult' },
    ];

    const plans = [];
    for (const p of plansData) {
      const planObj = await Plan.create({
        gym_id: gym._id,
        name: p.name,
        duration_days: p.duration_days,
        price: p.price,
        description: p.description,
        is_active: true,
      });
      plans.push(planObj);
      console.log(`Created Plan: ${planObj.name}`);
    }

    // 6. Create 20 Fake Members with Varied Profiles, Join Dates, and Statuses
    const membersData = [
      { name: 'Peter Parker', email: 'member1@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 10 },
      { name: 'Barry Allen', email: 'member2@ironpulse.com', plan: 'Yearly VIP', status: 'active', joinDaysAgo: 90 },
      { name: 'Wanda Maximoff', email: 'member3@ironpulse.com', plan: 'Weekly Basic', status: 'active', joinDaysAgo: 5 },
      { name: 'Steve Rogers', email: 'member4@ironpulse.com', plan: 'Yearly VIP', status: 'active', joinDaysAgo: 200 },
      { name: 'Natasha Romanoff', email: 'member5@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 120 },
      { name: 'Clint Barton', email: 'member6@ironpulse.com', plan: 'Weekly Basic', status: 'inactive', joinDaysAgo: 180 },
      { name: 'Bruce Banner', email: 'member7@ironpulse.com', plan: 'Monthly Elite', status: 'pending_approval', joinDaysAgo: 1 },
      { name: 'Sam Wilson', email: 'member8@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 45 },
      { name: 'Bucky Barnes', email: 'member9@ironpulse.com', plan: 'Yearly VIP', status: 'active', joinDaysAgo: 60 },
      { name: 'Scott Lang', email: 'member10@ironpulse.com', plan: 'Weekly Basic', status: 'inactive', joinDaysAgo: 150 },
      { name: 'Hope van Dyne', email: 'member11@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 30 },
      { name: 'T\'Challa', email: 'member12@ironpulse.com', plan: 'Yearly VIP', status: 'active', joinDaysAgo: 80 },
      { name: 'Carol Danvers', email: 'member13@ironpulse.com', plan: 'Yearly VIP', status: 'pending_approval', joinDaysAgo: 2 },
      { name: 'Stephen Strange', email: 'member14@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 15 },
      { name: 'Peter Quill', email: 'member15@ironpulse.com', plan: 'Weekly Basic', status: 'active', joinDaysAgo: 4 },
      { name: 'Gamora', email: 'member16@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 50 },
      { name: 'Drax', email: 'member17@ironpulse.com', plan: 'Weekly Basic', status: 'inactive', joinDaysAgo: 240 },
      { name: 'Rocket', email: 'member18@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 25 },
      { name: 'Groot', email: 'member19@ironpulse.com', plan: 'Weekly Basic', status: 'active', joinDaysAgo: 3 },
      { name: 'Mantis', email: 'member20@ironpulse.com', plan: 'Monthly Elite', status: 'active', joinDaysAgo: 8 },
    ];

    const members = [];
    for (let i = 0; i < membersData.length; i++) {
      const data = membersData[i];
      const user = await User.create({
        gym_id: gym._id,
        name: data.name,
        email: data.email,
        password_hash: plainPassword,
        role: 'member',
        phone: `555-301-00${String(i + 1).padStart(2, '0')}`,
      });

      // Assign members round-robin to our 3 trainers
      const assignedTrainer = trainers[i % trainers.length];

      // Distribute join dates
      const joinDate = new Date();
      joinDate.setDate(joinDate.getDate() - data.joinDaysAgo);

      // Find plan_id
      const matchedPlan = plans.find(p => p.name === data.plan);

      const member = await Member.create({
        user_id: user._id,
        gym_id: gym._id,
        plan_id: matchedPlan ? matchedPlan._id : null,
        plan_name: matchedPlan ? matchedPlan.name : data.plan,
        status: data.status,
        assigned_trainer_id: assignedTrainer._id,
        assigned_dietitian_id: assignedTrainer._id,
        join_date: joinDate,
      });

      members.push(member);
      console.log(`Created Member: ${user.name} (${user.email}), status: ${data.status}`);
    }

    // 7. Create at least 10 Payment Records (mix of paid/pending/unpaid/overdue)
    console.log('Seeding Payment records...');

    // We will generate payments for some of our members
    const paymentConfigs = [
      { member: members[0], status: 'paid', amount: 2000, daysAgo: 5, method: 'upi' },
      { member: members[1], status: 'paid', amount: 18000, daysAgo: 80, method: 'card' },
      { member: members[2], status: 'pending', amount: 500, daysAgo: 0, method: 'upi' },
      { member: members[3], status: 'paid', amount: 18000, daysAgo: 190, method: 'bank_transfer' },
      { member: members[4], status: 'paid', amount: 2000, daysAgo: 110, method: 'card' },
      { member: members[5], status: 'unpaid', amount: 500, daysAgo: 45, method: 'cash' }, // overdue
      { member: members[7], status: 'paid', amount: 2000, daysAgo: 40, method: 'upi' },
      { member: members[8], status: 'paid', amount: 18000, daysAgo: 55, method: 'bank_transfer' },
      { member: members[9], status: 'unpaid', amount: 500, daysAgo: 60, method: 'card' }, // overdue
      { member: members[10], status: 'pending', amount: 2000, daysAgo: 2, method: 'upi' },
      { member: members[11], status: 'paid', amount: 18000, daysAgo: 75, method: 'card' },
      { member: members[14], status: 'paid', amount: 500, daysAgo: 3, method: 'cash' },
    ];

    for (const p of paymentConfigs) {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - p.daysAgo);

      const dueDate = new Date(paymentDate);
      dueDate.setDate(dueDate.getDate() + 7); // Due 7 days after invoice billing date

      await Payment.create({
        member_id: p.member._id,
        gym_id: gym._id,
        amount: p.amount,
        payment_date: p.status === 'paid' ? paymentDate : null,
        due_date: dueDate,
        status: p.status,
        payment_method: p.method,
        plan_id: p.member.plan_id || null,
      });
    }
    console.log(`Seeded ${paymentConfigs.length} payment records.`);

    // 8. Create at least 3-5 Classes with Different Schedules
    console.log('Seeding Classes...');
    const classData = [
      { name: 'HIIT & Core Conditioning', trainer: trainers[0], hoursFromNow: 2, cap: 15 },
      { name: 'Power Weightlifting Strength', trainer: trainers[1], hoursFromNow: 24, cap: 12 },
      { name: 'Yoga, Balance & Flexibility', trainer: trainers[2], hoursFromNow: 48, cap: 20 },
      { name: 'Cardio Kickboxing Shred', trainer: trainers[0], hoursFromNow: 72, cap: 15 },
      { name: 'Zumba Fit Dance Party', trainer: trainers[1], hoursFromNow: 96, cap: 25 },
    ];

    for (const c of classData) {
      const classTime = new Date();
      classTime.setHours(classTime.getHours() + c.hoursFromNow);

      await Class.create({
        gym_id: gym._id,
        trainer_id: c.trainer._id,
        class_name: c.name,
        schedule_time: classTime,
        capacity: c.cap,
      });
    }
    console.log(`Seeded ${classData.length} classes.`);

    // 9. Create Workout & Diet Plans Linked to first member (Peter Parker)
    console.log('Seeding Workout & Diet plans...');
    const memberId = members[0]._id;
    const trainerId = trainers[0]._id;

    // Seed Workout Plans
    const workoutItems = [
      { day_of_week: 'Monday', day_subtitle: 'Chest & Triceps Power Focus', exercise_name: 'Incline Barbell Bench Press', sets: 4, reps: 10 },
      { day_of_week: 'Monday', day_subtitle: 'Chest & Triceps Power Focus', exercise_name: 'Tricep Rope Overhead Extension', sets: 3, reps: 12 },
      { day_of_week: 'Tuesday', day_subtitle: 'Back & Biceps Thickness Focus', exercise_name: 'Wide Grip Lat Pulldown', sets: 4, reps: 10 },
      { day_of_week: 'Tuesday', day_subtitle: 'Back & Biceps Thickness Focus', exercise_name: 'Preacher Dumbbell Curl', sets: 3, reps: 12 },
      { day_of_week: 'Wednesday', day_subtitle: 'Leg & Calf Strength Load', exercise_name: 'Barbell Back Squat (ATG)', sets: 4, reps: 8 },
      { day_of_week: 'Thursday', day_subtitle: 'Shoulder & Trap Hypertrophy', exercise_name: 'Dumbbell Overhead Press', sets: 4, reps: 10 },
      { day_of_week: 'Friday', day_subtitle: 'Arm & Core Conditioning Day', exercise_name: 'Cable Hammer Curl & Cable Pushdowns', sets: 3, reps: 15 },
      { day_of_week: 'Saturday', day_subtitle: 'Deadlift & Posterior Chain Day', exercise_name: 'Conventional Barbell Deadlift', sets: 5, reps: 5 },
    ];

    for (const item of workoutItems) {
      await WorkoutPlan.create({
        member_id: memberId,
        trainer_id: trainerId,
        exercise_name: item.exercise_name,
        sets: item.sets,
        reps: item.reps,
        day_of_week: item.day_of_week,
        day_subtitle: item.day_subtitle,
      });
    }

    // Seed Diet Plans
    const dietItems = [
      { day_of_week: 'Monday', day_subtitle: 'Clean High-Protein Builder', meal_name: 'Oats with Whey, Peanut Butter & Berries', calories: 550, protein: 35, carbs: 60, fat: 15 },
      { day_of_week: 'Monday', day_subtitle: 'Clean High-Protein Builder', meal_name: 'Grilled Chicken, Jasmine Rice & Steamed Broccoli', calories: 750, protein: 50, carbs: 85, fat: 18 },
      { day_of_week: 'Monday', day_subtitle: 'Clean High-Protein Builder', meal_name: 'Lean Beef Stir-Fry with Egg Noodles', calories: 850, protein: 55, carbs: 90, fat: 22 },
      { day_of_week: 'Tuesday', day_subtitle: 'Low Carb Condition Day', meal_name: 'Cheddar Bacon Omelette with Spinach', calories: 450, protein: 30, carbs: 3, fat: 35 },
      { day_of_week: 'Tuesday', day_subtitle: 'Low Carb Condition Day', meal_name: 'Pan-seared Salmon Fillet & Avocado Salad', calories: 700, protein: 45, carbs: 5, fat: 55 },
      { day_of_week: 'Wednesday', day_subtitle: 'Moderate Energy Balance', meal_name: 'Greek Yogurt with Blueberries & Flax Seeds', calories: 400, protein: 28, carbs: 30, fat: 12 },
      { day_of_week: 'Thursday', day_subtitle: 'Low Carb Condition Day', meal_name: 'Baked Cod Fillet & Lemon Herb Asparagus', calories: 450, protein: 40, carbs: 8, fat: 12 },
      { day_of_week: 'Friday', day_subtitle: 'Clean High-Protein Builder', meal_name: 'Banana Protein Pancakes with Honey', calories: 550, protein: 35, carbs: 70, fat: 10 },
      { day_of_week: 'Saturday', day_subtitle: 'Refeed & Recovery Focus', meal_name: 'Bunless Double Turkey Burger with Baked Potato', calories: 800, protein: 50, carbs: 95, fat: 20 },
    ];

    for (const item of dietItems) {
      await DietPlan.create({
        member_id: memberId,
        trainer_id: trainerId,
        meal_name: item.meal_name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        day_of_week: item.day_of_week,
        day_subtitle: item.day_subtitle,
      });
    }
    console.log('Seeded Member workout and diet routines successfully.');

    // 10. Seed Community Feed Posts (At least 3-4 posts)
    console.log('Seeding Community Feed Posts...');
    const postsData = [
      {
        author: owners[0],
        role: 'owner',
        img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000',
        cap: 'Welcome to the grand rebranding launch of IronPulse Fitness Center! Check out our new light, clean modern spaces and high-performance gears. Build strength, achieve goals, and let\'s keep pushing together! 💪🔥 #IronPulse #RebrandLaunch',
      },
      {
        author: trainers[0],
        role: 'trainer',
        img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
        cap: 'Monday Motivation: Do not expect results if you are not willing to put in the consistent daily sweat. Pro Tip: Prioritize progressive overload and target at least 2g of protein per kg of bodyweight! Let\'s shred this week! 🏋️‍♂️✨',
      },
      {
        author: trainers[1],
        role: 'trainer',
        img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000',
        cap: 'Consistency beats intensity every single time. 60 minutes of movement daily transforms your physique and health. What are you logging in your Workout Tracker today? Drop your sets and reps below! 👇',
      },
    ];

    for (const post of postsData) {
      await Post.create({
        gym_id: gym._id,
        author_id: post.author._id,
        author_role: post.role,
        image_url: post.img,
        caption: post.cap,
      });
    }
    console.log(`Seeded ${postsData.length} community feed posts.`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
