import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://127.0.0.1:27017';

const run = async () => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB');
  
  const db = client.db('gym-app');
  const workouts = await db.collection('workouts').find({}).toArray();
  console.log('Workouts in collection:', workouts);
  
  await client.close();
};

run();
