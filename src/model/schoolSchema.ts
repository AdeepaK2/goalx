import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Add bcrypt for password hashing
import { 
  SriLankanProvince, 
  SriLankanDistrict, 
  Location, 
  districtBelongsToProvince 
} from '../types/locationTypes';

// Define an interface for the school document with methods
interface ISchool extends mongoose.Document {
  schoolId: string;
  sid: number;
  password: string;
  name: string;
  location: {
    district: SriLankanDistrict;
    zonal?: string;
    province: SriLankanProvince;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  principalName?: string;
  verified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.model('Counter', counterSchema);

const schoolSchema = new mongoose.Schema({
  schoolId: { type: String, unique: true, index: true },   
  sid: {
    type: Number,
    index: true,
    validate: {
      validator: function (v: number) {
        return /^\d{5}$/.test(v.toString());
      },
      message: (props: { value: any }) => `${props.value} is not a valid 5-digit number!`
    }
  },
  password: { type: String, required: true }, // Add password field
  name: { type: String, required: true, index: true },
  location: {
    district: {
      type: String,
      enum: Object.values(SriLankanDistrict),
      required: true
    },
    zonal: String,
    province: {
      type: String,
      enum: Object.values(SriLankanProvince),
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    email: String,
    phone: String
  },
  principalName: String,
  verified: {
    type: Boolean,
    default: false
  }
});

// Create compound indexes for location-based queries
schoolSchema.index({ 'location.district': 1 });
schoolSchema.index({ 'location.division': 1 });
schoolSchema.index({ 'location.province': 1 });

// Compound index for geospatial queries
schoolSchema.index({ 'location.coordinates': '2d' });

// Create compound index for common search patterns
schoolSchema.index({ 'location.province': 1, 'location.district': 1 });

// Add district-province validation to pre-validate hook
schoolSchema.pre('validate', function(next) {
  const doc = this;
  const district = doc.location?.district as SriLankanDistrict;
  const province = doc.location?.province as SriLankanProvince;
  
  if (district && province) {
    if (!districtBelongsToProvince(district, province)) {
      const err = new Error(`District ${district} does not belong to province ${province}`);
      return next(err);
    }
  }
  
  next();
});

// Add pre-save hook for ID generation
schoolSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate sid if not already set
  if (!doc.sid) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'schoolId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 5 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(5, '0');
      doc.sid = parseInt(formattedSeq);
      
      // Generate schoolId if not set
      if (!doc.schoolId) {
        doc.schoolId = `SCH${formattedSeq}`;
      }
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Add pre-save hook for password hashing
schoolSchema.pre('save', async function(next) {
  const doc = this;
  
  if (doc.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(doc.password, salt);
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Add method to compare passwords
schoolSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<ISchool>('School', schoolSchema);