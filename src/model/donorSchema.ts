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
  address?: {
    street?: string;
    city?: string;
    district?: SriLankanDistrict;
    province?: SriLankanProvince;
    postalCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Counter schema for auto-incrementing donorId
const donorCounterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const DonorCounter = mongoose.model('DonorCounter', donorCounterSchema);

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
  // Add password field for authentication
  password: { 
    type: String, 
    required: true 
  },
  phone: { type: String, sparse: true, index: true },
  address: {
    street: String,
    city: { type: String, index: true },
    district: {
      type: String,
      enum: Object.values(SriLankanDistrict),
      index: true
    },
    province: {
      type: String,
      enum: Object.values(SriLankanProvince),
      index: true
    },
    postalCode: { type: String, index: true }
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  discriminatorKey: 'donorType'
});

// Text index for full-text search across key donor information
donorSchema.index({ displayName: 'text', 'contact.email': 'text' }, { 
  name: 'donor_text_search',
  weights: { displayName: 10, 'contact.email': 5 }
});

// Compound index for location-based filtering
donorSchema.index({ 
  'address.province': 1, 
  'address.district': 1, 
  'address.city': 1 
}, { name: 'location_search' });

// Compound index for listing donors by type with sorting
donorSchema.index({ donorType: 1, createdAt: -1 }, { name: 'donor_type_listing' });

// Compound index for contact information lookups
donorSchema.index({ 'contact.email': 1, 'contact.phone': 1 }, { name: 'contact_lookup' });

// Efficient sorting by last update within donor type
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

const Donor = mongoose.model<IDonor>('Donor', donorSchema);

export default Donor;