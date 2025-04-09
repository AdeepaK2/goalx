import mongoose from 'mongoose';
import { SriLankanProvince, SriLankanDistrict } from '../types/locationTypes';
import bcrypt from 'bcryptjs'; // Add this import

// Governing Body Schema
const governBodySchema = new mongoose.Schema({
  governBodyId: { type: String, unique: true, index: true },
  name: { type: String, required: true, index: true },
  abbreviation: { type: String, index: true },
  // Optional specialized sport
  specializedSport: { 
    type: String,
    index: true
  },
  description: { type: String },
  logoUrl: { type: String },
  contact: {
    phone: { type: String, index: true },
    website: { type: String },
  },
  // Authentication fields
  email: { type: String, required: true, index: true },
  password: { type: String, required: true, select: false }, // select:false means it won't be returned in queries by default
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Add verification fields
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, index: true },
  verificationTokenExpiry: { type: Date },
  adminVerified: { type: Boolean, default: false },
  active: { type: Boolean, default: true, select: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Text index for full-text search
governBodySchema.index({ name: 'text', abbreviation: 'text', description: 'text' }, {
  name: 'govern_body_text_search',
  weights: { name: 10, abbreviation: 8, description: 3 }
});

// Index for sport filtering
governBodySchema.index({ specializedSport: 1 }, { name: 'sport_filter' });

// Update timestamp on update
governBodySchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Add this method to your governBodySchema for password comparison
governBodySchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add pre-save hook for password hashing
governBodySchema.pre('save', async function(next) {
  const governBody = this as any;
  
  // Only hash the password if it has been modified or is new
  if (!governBody.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    governBody.password = await bcrypt.hash(governBody.password, salt);
    next();
  } catch (error) {
    return next(error as Error);
  }
});

// Export the model, checking if it already exists first
export default mongoose.models.GovernBody || mongoose.model('GovernBody', governBodySchema);
