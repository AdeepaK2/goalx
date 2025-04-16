import mongoose from 'mongoose';

// Define an interface for equipment transaction items
interface IGovernTransactionItem {
  equipment: mongoose.Types.ObjectId;  // Reference to Equipment document
  quantity: number;
  condition: string; 
  serialNumbers?: string[];
  notes?: string;
}

// Define an interface for govern body to school transactions
interface IGovernEquipTransaction extends mongoose.Document {
  transactionId: string;
  governBody: mongoose.Types.ObjectId;  // Reference to Governing Body document
  school: mongoose.Types.ObjectId;      // Reference to School document (recipient)
  transactionType: 'rental' | 'permanent';
  items: IGovernTransactionItem[];
  rentalDetails?: {
    startDate: Date;
    returnDueDate: Date;
    returnedDate?: Date;
    rentalFee?: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  additionalNotes?: string;
  termsAndConditions?: string;
  requestReference?: string;          // Reference to original equipment request
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
}

// Get the counter schema model or create it
const Counter = mongoose.models.Counter || 
  mongoose.model('Counter', new mongoose.Schema({
    _id: String,
    seq: Number
  }));

const governEquipTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, index: true },
  governBody: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GovernBody',
    required: true
  },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School',
    required: true 
  },
  transactionType: { 
    type: String, 
    enum: ['rental', 'permanent'],
    required: true
  },
  items: [{
    equipment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Equipment',
      required: true 
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    condition: {
      type: String,
      enum: ['new', 'excellent', 'good', 'fair', 'poor'],
      required: true
    },
    serialNumbers: [String],
    notes: {
      type: String,
      trim: true
    }
  }],
  rentalDetails: {
    startDate: { 
      type: Date,
      required: function(this: any) { return this.transactionType === 'rental'; }
    },
    returnDueDate: { 
      type: Date,
      required: function(this: any) { return this.transactionType === 'rental'; }
    },
    returnedDate: {
      type: Date
    },
    rentalFee: {
      type: Number,
      min: 0
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'returned'],
    default: 'pending'
  },
  requestReference: {
    type: String,
    trim: true,
    index: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  createdAt: { 
    type: Date,
    default: Date.now
  },
  updatedAt: { 
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Validate that return due date is after start date for rentals
governEquipTransactionSchema.path('rentalDetails.returnDueDate').validate(function(value: Date) {
  if (this.transactionType === 'rental' && this.rentalDetails?.startDate && value) {
    return value > this.rentalDetails.startDate;
  }
  return true;
}, 'Return due date must be after start date');

// Create indexes for common query patterns
governEquipTransactionSchema.index({ governBody: 1 });
governEquipTransactionSchema.index({ school: 1 });
governEquipTransactionSchema.index({ status: 1 });
governEquipTransactionSchema.index({ createdAt: -1 });
governEquipTransactionSchema.index({ transactionType: 1 });
governEquipTransactionSchema.index({ requestReference: 1 });
governEquipTransactionSchema.index({ 'items.equipment': 1 });

// Validate that transaction has at least one item
governEquipTransactionSchema.path('items').validate(
  function(items: any[]) {
    return items.length > 0;
  }, 
  'At least one equipment item must be included in the transaction'
);

// Generate a unique transaction ID
governEquipTransactionSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate transactionId if not already set
  if (!doc.transactionId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'governEquipTransactionId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 6 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      // Generate transactionId with prefix based on transaction type
      const prefix = doc.transactionType === 'rental' ? 'GRT' : 'GTF';  // Govern Rental/Transfer
      doc.transactionId = `${prefix}${formattedSeq}`;
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Update updatedAt timestamp on every save
governEquipTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Set approvedAt date when status changes to approved
governEquipTransactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

export default mongoose.models.GovernEquipTransaction || 
  mongoose.model<IGovernEquipTransaction>('GovernEquipTransaction', governEquipTransactionSchema);