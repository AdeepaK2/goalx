import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { SriLankanProvince, SriLankanDistrict } from '../types/locationTypes';

// Define interface for donor document with authentication method
interface IDonor extends mongoose.Document {
  donorId: string;
  displayName: string;
  profilePicUrl?: string;
  donorType: 'INDIVIDUAL' | 'COMPANY';
  email: string;
  password: string;
  phone?: string;
  address?: string;
  verified: boolean;
  note: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Safe model registration function
function getModel<T extends mongoose.Document>(
  modelName: string,
  schema: mongoose.Schema
): mongoose.Model<T> {
  return mongoose.models[modelName] || mongoose.model<T>(modelName, schema);
}

// Counter schema for auto-incrementing donorId
const donorCounterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

// Interface for counter document
interface ICounter extends mongoose.Document {
  _id: string;
  seq: number;
}

// Fix: Use the safe model registration function with proper typing
const DonorCounter = getModel<ICounter>('DonorCounter', donorCounterSchema);

// Base donor schema with common fields for both types
const donorSchema = new mongoose.Schema({
  donorId: { type: String, unique: true, index: true },
  displayName: { type: String, required: true, index: true },
  profilePicUrl: { type: String },
  donorType: { 
    type: String, 
    required: true,
    enum: ['INDIVIDUAL', 'COMPANY'],
    index: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { type: String, sparse: true, index: true },
  address: { type: String, index: true },
  verified: { type: Boolean, default: false },
  note: { type: String, default: '' },
  verificationToken: { type: String, index: true },
  verificationTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  discriminatorKey: 'donorType'
});

// Set up indexes
donorSchema.index({ displayName: 'text', email: 'text', address: 'text' }, { 
  name: 'donor_text_search',
  weights: { displayName: 10, email: 5, address: 3 }
});

donorSchema.index({ donorType: 1, createdAt: -1 }, { name: 'donor_type_listing' });
donorSchema.index({ verified: 1, donorType: 1 }, { name: 'verification_status' });
donorSchema.index({ donorType: 1, updatedAt: -1 }, { name: 'donor_type_updates' });

// Add method to compare passwords for authentication
donorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add pre-save hook for password hashing
donorSchema.pre('save', async function(next) {
  const donor = this as unknown as IDonor;
  
  // Only hash the password if it has been modified or is new
  if (donor.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      donor.password = await bcrypt.hash(donor.password, salt);
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Pre-save middleware to auto-increment donorId
donorSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    const prefix = this.donorType === 'INDIVIDUAL' ? 'IND' : 'COM';
    const counter = await DonorCounter.findByIdAndUpdate(
      { _id: 'donorId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    this.donorId = `${prefix}-${(counter.seq || 0).toString().padStart(6, '0')}`;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Direct model registration pattern
export default mongoose.models.Donor || mongoose.model<IDonor>('Donor', donorSchema);
