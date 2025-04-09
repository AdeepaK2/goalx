import mongoose from 'mongoose';

// Define an interface for the play document
interface IPlay extends mongoose.Document {
  playId: string;
  school: mongoose.Types.ObjectId;  // Reference to School document
  sport: mongoose.Types.ObjectId;   // Reference to Sport document
  startedYear?: number;
  isActive: boolean;
  lastUpdated: Date;
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const playSchema = new mongoose.Schema({
  playId: { type: String, unique: true, index: true },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  sport: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sport', 
    required: true 
  },
  startedYear: { 
    type: Number,
    validate: {
      validator: function(v: number) {
        return v >= 1800 && v <= new Date().getFullYear();
      },
      message: (props: { value: any }) => `${props.value} is not a valid year!`
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Create a compound unique index on school and sport to prevent duplicates
playSchema.index({ school: 1, sport: 1 }, { unique: true });

// Create indexes for common query patterns
playSchema.index({ school: 1 });
playSchema.index({ sport: 1 });
playSchema.index({ isActive: 1 });

// Add pre-save hook for ID generation
playSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate playId if not already set
  if (!doc.playId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'playId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 6 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      // Generate playId
      doc.playId = `PLY${formattedSeq}`;
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Update lastUpdated timestamp on every save
playSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.Play || mongoose.model<IPlay>('Play', playSchema);