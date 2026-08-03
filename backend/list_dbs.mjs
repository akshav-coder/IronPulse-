import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/';

const run = async () => {
  const conn = await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const adminDb = conn.connection.useDb('admin').db;
  const dbs = await adminDb.admin().listDatabases();
  console.log('Databases list:');
  for (const dbInfo of dbs.databases) {
    console.log(`- Database: ${dbInfo.name}`);
    const tempConn = conn.connection.useDb(dbInfo.name);
    const collections = await tempConn.db.listCollections().toArray();
    for (const col of collections) {
      const count = await tempConn.db.collection(col.name).countDocuments();
      console.log(`  * ${col.name}: ${count} docs`);
    }
  }

  await mongoose.disconnect();
};

run();
