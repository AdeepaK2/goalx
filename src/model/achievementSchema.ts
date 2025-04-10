import mongoose from 'mongoose';

// Define an interface for the achievement document
interface IAchievement extends mongoose.Document {
  achievementId: string;
  play: mongoose.Types.ObjectId;  // Reference to Play document (school-sport relationship)
  title: string;
  year: number;
  level: string; // National, Provincial, District, Zonal, etc.
  position?: string; // 1st place, runner-up, semifinalist, etc.
  event?: string;
  description?: string;
  mediaLinks?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const achievementSchema = new mongoose.Schema({
  achievementId: { type: String, unique: true, index: true },
  play: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Play',
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  year: { 
    type: Number,
    required: true,
    validate: {
      validator: function(v: number) {
        return v >= 1800 && v <= new Date().getFullYear();
      },
      message: (props: { value: any }) => `${props.value} is not a valid year!`
    }
  },
  level: { 
    type: String,
    required: true,
    enum: [ 'Zonal', 'District', 'Provincial', 'National', 'International']
  },
  position: { 
    type: String
  },
  event: {
    type: String
  },
  description: {
    type: String
  },
  mediaLinks: [{
    type: String,
    validate: {
      validator: function(v: string) {
        // Basic URL validation
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: (props: { value: any }) => `${props.value} is not a valid URL!`
    }
  }],
  createdAt: { 
    type: Date,
    default: Date.now
  },
  updatedAt: { 
    type: Date,
    default: Date.now
  }
});

// Create indexes for common query patterns
achievementSchema.index({ play: 1 });
achievementSchema.index({ year: 1 });
achievementSchema.index({ level: 1 });
achievementSchema.index({ 'play': 1, 'year': 1 });

// Add pre-save hook for ID generation
achievementSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate achievementId if not already set
  if (!doc.achievementId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'achievementId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 6 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      // Generate achievementId
      doc.achievementId = `ACH${formattedSeq}`;
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Update updatedAt timestamp on every save
achievementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', achievementSchema);