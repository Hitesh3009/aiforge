import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log(MONGODB_URI)
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}


export async function connectToDatabase() {
  let connection = mongoose.connect(MONGODB_URI, {
    dbName: 'aiforge'
  });
  
  return connection;
}
