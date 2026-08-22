import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log('Connected to MongoDB database successfully.');
      return;
    } catch (err) {
      console.warn('Failed to connect to provided MongoDB URI, falling back to In-Memory MongoDB:', err.message);
    }
  }

  try {
    console.log('Initializing embedded In-Memory MongoDB Server for zero-friction development...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(inMemoryUri);
    console.log(`Connected to In-Memory MongoDB at: ${inMemoryUri}`);
  } catch (error) {
    console.error('CRITICAL: Failed to initialize MongoDB connection:', error.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
