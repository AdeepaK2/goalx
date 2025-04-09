import mongoose from 'mongoose';

// Payment method enum for better type safety
enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  OTHER = 'OTHER'
}

// Define interfaces for donation items
interface IDonationItem {
  itemName: string;
  description?: string;
  quantity: number;
  estimatedValue?: number;
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
}

interface IMonetaryDonation {
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
  verificationCode?: string; // Added for transaction verification
}

// Status history interface for better tracking
interface IStatusChange {
  status: string;
  date: Date;
  changedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

// Define interface for donation document
interface IDonation extends mongoose.Document {
  donationId: string;
  donor: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  donationType: 'MONETARY' | 'EQUIPMENT' | 'OTHER';
  campaign?: string;
  purpose?: string;
  anonymous: boolean;
  status: 'pending' | 'completed' | 'processing' | 'failed' | 'canceled';
  statusHistory: IStatusChange[];
  monetaryDetails?: IMonetaryDonation;
  itemDetails?: IDonationItem[];
  notes?: string;
  receiptIssued: boolean;
  receiptUrl?: string;
  taxDeductible?: boolean; // Added for tax purposes
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Counter schema for auto-incrementing donationId
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const donationSchema = new mongoose.Schema({
  donationId: { 
    type: String, 
    unique: true, 
    index: true 
  },
  donor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Donor',
    required: true,
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        // Check if donor exists
        const Donor = mongoose.model('Donor');
        const donor = await Donor.findById(value);
        return !!donor;
      },
      message: 'Referenced donor does not exist'
    }
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School',
    required: true,
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        // Check if school exists
        const School = mongoose.model('School');
        const school = await School.findById(value);
        return !!school;
      },
      message: 'Referenced school does not exist'
    }
  },
  donationType: { 
    type: String, 
    enum: ['MONETARY', 'EQUIPMENT', 'OTHER'],
    required: true 
  },
  campaign: { 
    type: String,
    trim: true,
    index: true
  },
  purpose: {
    type: String,
    trim: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'processing', 'failed', 'canceled'],
    default: 'pending',
    index: true
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'completed', 'processing', 'failed', 'canceled'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  monetaryDetails: {
    amount: {
      type: Number,
      min: 0,
      required: function(this: any) { return this.donationType === 'MONETARY'; }
    },
    currency: {
      type: String,
      default: 'LKR',
      required: function(this: any) { return this.donationType === 'MONETARY'; }
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      trim: true
    },
    transactionReference: {
      type: String,
      trim: true
    },
    verificationCode: {
      type: String,
      trim: true
    }
  },
  itemDetails: [{
    itemName: {
      type: String,
      required: function(this: any) { 
        return this.parent().donationType === 'EQUIPMENT' || this.parent().donationType === 'OTHER'; 
      },
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    estimatedValue: {
      type: Number,
      min: 0
    },
    condition: {
      type: String,
      enum: ['new', 'excellent', 'good', 'fair', 'poor']
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  receiptIssued: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  taxDeductible: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Create indexes for common query patterns
donationSchema.index({ donor: 1 });
donationSchema.index({ recipient: 1 });
donationSchema.index({ donationType: 1 });
donationSchema.index({ 'monetaryDetails.amount': 1 });
donationSchema.index({ campaign: 1, status: 1 });
donationSchema.index({ donor: 1, recipient: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ taxDeductible: 1 }); // Added for tax reporting queries

// Validate that donation has appropriate details based on type
donationSchema.pre('validate', function(next) {
  const donation = this;
  
  if (donation.donationType === 'MONETARY' && (!donation.monetaryDetails || !donation.monetaryDetails.amount)) {
    return next(new Error('Monetary donations require amount details'));
  }
  
  if ((donation.donationType === 'EQUIPMENT' || donation.donationType === 'OTHER') && 
      (!donation.itemDetails || donation.itemDetails.length === 0)) {
    return next(new Error('Equipment/Other donations require item details'));
  }
  
  next();
});

// Generate a unique donation ID
donationSchema.pre('save', async function(next) {
  const doc = this;
  
  if (!doc.donationId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'donationId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format with prefix based on donation type
      const seqValue = counter?.seq ?? 1;
      const formattedSeq = seqValue.toString().padStart(6, '0');
      
      const prefix = doc.donationType === 'MONETARY' ? 'DON-M' : 
                     doc.donationType === 'EQUIPMENT' ? 'DON-E' : 'DON-O';
      
      doc.donationId = `${prefix}${formattedSeq}`;
      
      next();
    } catch (error) {
      console.error('Error generating donation ID:', error);
      return next(error as Error);
    }
  } else {
    next();
  }
});

// Track status history
donationSchema.pre('save', function(next) {
  const doc = this as unknown as IDonation;
  
  if (doc.isModified('status')) {
    const currentStatus = doc.status;
    
    // Add to status history
    if (!doc.statusHistory) {
      doc.statusHistory = [];
    }
    
    doc.statusHistory.push({
      status: currentStatus,
      date: new Date()
    });
  }
  
  next();
});

// Update updatedAt timestamp on every save
donationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Set completedAt date when status changes to completed
donationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', donationSchema);