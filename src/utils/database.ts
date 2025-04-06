import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_DB_URI = process.env.MONGO_DB_URI;
let dbClient: MongoClient | null = null;
let database: Db | null = null;

/**
 * Connects to MongoDB using the MONGO_DB_URI from environment variables
 * @returns {Promise<Db>} The database connection
 */
export async function connect(): Promise<Db> {
  try {
    // Return existing connection if available
    if (database) {
      return database;
    }
    
    if (!MONGO_DB_URI) {
      throw new Error('MONGO_DB_URI environment variable is not defined');
    }

    // Create new MongoDB client and connect
    dbClient = new MongoClient(MONGO_DB_URI);
    await dbClient.connect();
    
    database = dbClient.db();
    
    console.log('Successfully connected to MongoDB');
    return database;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Closes the MongoDB connection
 */
export async function disconnect(): Promise<void> {
  try {
    if (dbClient) {
      await dbClient.close();
      dbClient = null;
      database = null;
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
}