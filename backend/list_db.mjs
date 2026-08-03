import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in gym-app database:');
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`- ${col.name}: ${count} documents`);
    if (col.name === 'workouts' || col.name === 'workoutplans') {
      const items = await mongoose.connection.db.collection(col.name).find({}).toArray();
      console.log('  Items:', items.map(i => ({ _id: i._id, title: i.title, name: i.exercise_name, user: i.user, member: i.member_id })));
    }
  }

  await mongoose.disconnect();
};

run();
