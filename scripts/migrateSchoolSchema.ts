import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateSchoolSchema() {
  try {
    console.log('Starting school schema migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB_URI as string);
    console.log('Connected to MongoDB');
    
    // Run the migration query to update all schools that don't have the adminVerified field
    const result = await mongoose.connection.db!.collection('schools').updateMany(
      { adminVerified: { $exists: false } }, // Find documents without adminVerified
      { $set: { adminVerified: false } } // Set it to false
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} schools.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateSchoolSchema();