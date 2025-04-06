import mongoose from 'mongoose';

/**
 * Interface representing a Sport entity
 */
export interface Sport {
  sportId: string;
  sportName: string;
  description: string;
  categories: string[];
}

/**
 * Class implementation of Sport model
 */
export class SportModel implements Sport {
  sportId: string;
  sportName: string;
  description: string;
  categories: string[];

  constructor(
    sportId: string,
    sportName: string,
    description: string,
    categories: string[] = []
  ) {
    this.sportId = sportId;
    this.sportName = sportName;
    this.description = description;
    this.categories = categories;
  }
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.model('Counter', counterSchema);

const sportSchema = new mongoose.Schema({
  sportId: { type: String, unique: true, index: true },
  sportName: { type: String, required: true, index: true },
  description: { type: String, required: true },
  categories: { type: [String], default: [] }
});

// Create indexes for common search patterns
sportSchema.index({ sportName: 1 });
sportSchema.index({ categories: 1 });

// Add pre-save hook for ID generation
sportSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate sportId if not already set
  if (!doc.sportId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'sportId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 4 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(4, '0');
      
      // Generate sportId
      doc.sportId = `SPT${formattedSeq}`;
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Sport', sportSchema);