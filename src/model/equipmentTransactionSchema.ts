import mongoose from 'mongoose';

// Define an interface for equipment transaction items
interface ITransactionItem {
  equipment: mongoose.Types.ObjectId;  // Reference to Equipment document
  quantity: number;
  condition: string; // Condition of the equipment (e.g., "new", "good", "fair", "poor")
  serialNumbers?: string[]; // Optional serial numbers for tracking
  notes?: string;
}

// Define an interface for equipment transactions
interface IEquipmentTransaction extends mongoose.Document {
  transactionId: string;
  providerType: 'school' | 'governBody';
  provider: mongoose.Types.ObjectId;  // Reference to School or GovernBody document
  recipient: mongoose.Types.ObjectId;  // Reference to School document (recipient)
  transactionType: 'rental' | 'permanent';
  items: ITransactionItem[];
  rentalDetails?: {
    startDate: Date;
    returnDueDate: Date;
    returnedDate?: Date;
    rentalFee?: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  additionalNotes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const equipmentTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, index: true },
  providerType: { 
    type: String, 
    enum: ['school', 'GovernBody'], // Capital 'G' to match your model name
    required: true,
    // Add this getter/setter to enforce correct model mapping
    set: function(value: string) {
      // Store the value as-is
      return value;
    },
    get: function(value: string) {
      // When used for population, return the correct model name
      return value === 'school' ? 'School' : value;
    }
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'providerType'
  },
  recipient: { 
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
    ref: 'User'  // Reference to User model for administrators/approvers
  }
});

// Validate that return due date is after start date for rentals
equipmentTransactionSchema.path('rentalDetails.returnDueDate').validate(function(value: Date) {
  if (this.transactionType === 'rental' && this.rentalDetails?.startDate && value) {
    return value > this.rentalDetails.startDate;
  }
  return true;
}, 'Return due date must be after start date');

// Create indexes for common query patterns
equipmentTransactionSchema.index({ provider: 1, providerType: 1 });
equipmentTransactionSchema.index({ recipient: 1 });
equipmentTransactionSchema.index({ status: 1 });
equipmentTransactionSchema.index({ createdAt: -1 });
equipmentTransactionSchema.index({ transactionType: 1 });
equipmentTransactionSchema.index({ 'items.equipment': 1 });
equipmentTransactionSchema.index({ 'rentalDetails.startDate': 1 });
equipmentTransactionSchema.index({ 'rentalDetails.returnDueDate': 1 });

// Validate that transaction has at least one item
equipmentTransactionSchema.path('items').validate(
  function(items: any[]) {
    return items.length > 0;
  }, 
  'At least one equipment item must be included in the transaction'
);

// Check that provider and recipient are not the same
equipmentTransactionSchema.pre('validate', function(next) {
  if (this.providerType === 'school' && this.provider.toString() === this.recipient.toString()) {
    return next(new Error('Provider and recipient cannot be the same school'));
  }
  next();
});

// Generate a unique transaction ID
equipmentTransactionSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate transactionId if not already set
  if (!doc.transactionId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'equipmentTransactionId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 6 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      // Generate transactionId with prefix based on transaction type
      const prefix = doc.transactionType === 'rental' ? 'RNT' : 'TRF';
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
equipmentTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Set approvedAt date when status changes to approved
equipmentTransactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

export default mongoose.models.EquipmentTransaction || mongoose.model<IEquipmentTransaction>('EquipmentTransaction', equipmentTransactionSchema);