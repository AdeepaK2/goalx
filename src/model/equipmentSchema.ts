import mongoose from 'mongoose';

// Define an interface for the equipment document
interface IEquipment extends mongoose.Document {
  equipmentId: string;
  name: string;
  sport: mongoose.Types.ObjectId;  // Reference to Sport document
  description?: string;
  costPerUnit?: number;
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const equipmentSchema = new mongoose.Schema({
  equipmentId: { type: String, unique: true, index: true },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  sport: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sport',
    required: true 
  },
  description: { 
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    min: 0
  },
});

// Create indexes for common query patterns
equipmentSchema.index({ sport: 1 });
equipmentSchema.index({ name: 1 });


// Add pre-save hook for ID generation
equipmentSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate equipmentId if not already set
  if (!doc.equipmentId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'equipmentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 6 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      // Generate equipmentId
      doc.equipmentId = `EQP${formattedSeq}`;
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});


export default mongoose.model<IEquipment>('Equipment', equipmentSchema);

