import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_DB_URI = process.env.MONGO_DB_URI;
let isConnected = false;

/**
 * Connects to MongoDB using Mongoose
 */
export async function connect(): Promise<void> {
  // Return if already connected
  if (isConnected) {
    return;
  }
  
  if (!MONGO_DB_URI) {
    throw new Error('MONGO_DB_URI environment variable is not defined');
  }

  try {
    // Configure Mongoose connection
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB using Mongoose
    await mongoose.connect(MONGO_DB_URI);
    
    isConnected = true;
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Closes the MongoDB connection
 */
export async function disconnect(): Promise<void> {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
}