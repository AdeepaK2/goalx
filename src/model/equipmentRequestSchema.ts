import mongoose from 'mongoose';

// Define an interface for equipment request items
interface IRequestItem {
  equipment: mongoose.Types.ObjectId;  // Reference to Equipment document
  quantityRequested: number;
  quantityApproved?: number;
  notes?: string;
}

// Define an interface for the equipment request document
interface IEquipmentRequest extends mongoose.Document {
  requestId: string;
  school: mongoose.Types.ObjectId;  // Reference to School document
  eventName: string;
  eventStartDate?: Date;
  eventEndDate?: Date;
  eventDescription: string;
  requestLetterUrl?: string;
  items: IRequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'partial' | 'delivered';
  additionalNotes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const equipmentRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, index: true },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School',
    required: true 
  },
  eventName: { 
    type: String, 
    required: true,
    trim: true
  },
  eventStartDate: { 
    type: Date,
    validate: {
      validator: function(v: Date) {
        // Event start date should be in the future
        return v >= new Date();
      },
      message: 'Event start date must be in the future'
    }
  },
  eventEndDate: { 
    type: Date
  },
  eventDescription: { 
    type: String,
    required: true,
    trim: true
  },
  requestLetterUrl: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic URL validation
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: (props: { value: any }) => `${props.value} is not a valid URL!`
    }
  },
  items: [{
    equipment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Equipment',
      required: true 
    },
    quantityRequested: {
      type: Number,
      required: true,
      min: 1
    },
    quantityApproved: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'partial', 'delivered'],
    default: 'pending'
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  rejectionReason: {
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
  processedAt: {
    type: Date
  },
  processedBy: {
    type: String,
    trim: true
  }
});

// Validate that end date is not before start date
equipmentRequestSchema.path('eventEndDate').validate(function(value: Date) {
  if (this.eventStartDate && value) {
    return value >= this.eventStartDate;
  }
  return true;
}, 'Event end date cannot be before start date');

// Create indexes for common query patterns
equipmentRequestSchema.index({ school: 1 });
equipmentRequestSchema.index({ status: 1 });
equipmentRequestSchema.index({ createdAt: -1 });
equipmentRequestSchema.index({ 'items.equipment': 1 });
equipmentRequestSchema.index({ eventStartDate: 1 });
equipmentRequestSchema.index({ eventEndDate: 1 });

// Validate that request has at least one item
equipmentRequestSchema.path('items').validate(
  function(items: any[]) {
    return items.length > 0;
  }, 
  'At least one equipment item must be requested'
);

// Add pre-save hook for ID generation
equipmentRequestSchema.pre('save', async function(next) {
  const doc = this;
  
  // Only generate requestId if not already set
  if (!doc.requestId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'equipmentRequestId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format to ensure 6 digits with leading zeros
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      // Generate requestId
      doc.requestId = `REQ${formattedSeq}`;
      
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Update updatedAt timestamp on every save
equipmentRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// If status changes to approved, rejected, or partial, set processedAt date
equipmentRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const status = this.get('status');
    if (['approved', 'rejected', 'partial'].includes(status)) {
      if (!this.processedAt) {
        this.processedAt = new Date();
      }
    }
  }
  next();
});

export default mongoose.model<IEquipmentRequest>('EquipmentRequest', equipmentRequestSchema);