import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/gym-app';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  try {
    // Drop the unique index on member_id
    await mongoose.connection.db.collection('dietplans').dropIndex('member_id_1');
    console.log('Index member_id_1 successfully dropped!');
  } catch (error) {
    console.error('Failed to drop index:', error.message);
    console.log('Listing existing indexes on dietplans collection:');
    const indexes = await mongoose.connection.db.collection('dietplans').indexes();
    console.log(indexes);
  }

  await mongoose.disconnect();
};

run();
