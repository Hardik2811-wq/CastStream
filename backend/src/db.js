import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Attempting connection to MONGODB_URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] Connected successfully to external MongoDB.`);
      return;
    } catch (err) {
      console.warn(`[Database] External MongoDB connection failed (${err.message}). Falling back to in-memory instance.`);
    }
  }

  console.log(`[Database] Spinning up high-performance in-memory MongoDB engine...`);
  mongoMemoryServer = await MongoMemoryServer.create();
  const memUri = mongoMemoryServer.getUri();
  await mongoose.connect(memUri);
  console.log(`[Database] In-memory MongoDB online at: ${memUri}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
