import { NextRequest, NextResponse } from 'next/server';
import { ensureConnection } from '@/utils/connectionManager';
import EquipmentTransaction from '@/model/equipmentTransactionSchema';
import Equipment from '@/model/equipmentSchema';
import School from '@/model/schoolSchema';
import GovernBody from '@/model/governBodySchema';
import mongoose from 'mongoose';

// GET endpoint - fetch equipment transactions
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const providerId = searchParams.get('provider');
    const providerType = searchParams.get('providerType');
    const recipientId = searchParams.get('recipient');
    const status = searchParams.get('status');
    const transactionType = searchParams.get('transactionType');
    const equipmentId = searchParams.get('equipment');
    const startDateFrom = searchParams.get('startDateFrom');
    const startDateTo = searchParams.get('startDateTo');
    const returnDueDateFrom = searchParams.get('returnDueDateFrom');
    const returnDueDateTo = searchParams.get('returnDueDateTo');

    // If ID is provided, fetch specific transaction
    if (id) {
      const transaction = await EquipmentTransaction.findOne({ 
        $or: [{ _id: id }, { transactionId: id }] 
      })
      .populate('provider')
      .populate('recipient', 'name schoolId')
      .populate('items.equipment', 'name equipmentId')
      .populate('approvedBy', 'fullName email');
      
      if (!transaction) {
        return new NextResponse(JSON.stringify({ error: 'Equipment transaction not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(transaction), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    
    // Provider filters
    if (providerId && providerType) {
      query.provider = providerId;
      query.providerType = providerType;
    } else if (providerId) {
      query.provider = providerId;
    } else if (providerType) {
      query.providerType = providerType;
    }
    
    // Other filters
    if (recipientId) query.recipient = recipientId;
    if (status) query.status = status;
    if (transactionType) query.transactionType = transactionType;
    if (equipmentId) query['items.equipment'] = equipmentId;
    
    // Handle date ranges for rentals
    if (startDateFrom || startDateTo) {
      query['rentalDetails.startDate'] = {};
      if (startDateFrom) query['rentalDetails.startDate'].$gte = new Date(startDateFrom);
      if (startDateTo) query['rentalDetails.startDate'].$lte = new Date(startDateTo);
    }
    
    if (returnDueDateFrom || returnDueDateTo) {
      query['rentalDetails.returnDueDate'] = {};
      if (returnDueDateFrom) query['rentalDetails.returnDueDate'].$gte = new Date(returnDueDateFrom);
      if (returnDueDateTo) query['rentalDetails.returnDueDate'].$lte = new Date(returnDueDateTo);
    }

    // Fetch transactions with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const transactions = await EquipmentTransaction.find(query)
      .populate('provider')
      .populate('recipient', 'name schoolId')
      .populate('items.equipment', 'name equipmentId')
      .populate('approvedBy', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await EquipmentTransaction.countDocuments(query);

    return new NextResponse(JSON.stringify({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching equipment transactions:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch equipment transactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new equipment transaction
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const body = await request.json();
    
    // Validate required fields
    if (!body.providerType || !body.provider || !body.recipient || !body.transactionType || !body.items || body.items.length === 0) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['providerType', 'provider', 'recipient', 'transactionType', 'items (non-empty array)'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if provider exists based on providerType
    let providerExists = false;
    if (body.providerType === 'school') {
      const school = await School.findById(body.provider);
      providerExists = !!school;
    } else if (body.providerType === 'governBody') {
      const governBody = await GovernBody.findById(body.provider);
      providerExists = !!governBody;
    } else {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid providerType. Must be either "school" or "governBody"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!providerExists) {
      return new NextResponse(JSON.stringify({ 
        error: 'Provider not found with the given ID'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if recipient school exists
    const recipient = await School.findById(body.recipient);
    if (!recipient) {
      return new NextResponse(JSON.stringify({ 
        error: 'Recipient school not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check that provider and recipient are not the same when provider is a school
    if (body.providerType === 'school' && body.provider === body.recipient) {
      return new NextResponse(JSON.stringify({ 
        error: 'Provider and recipient cannot be the same school'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate items array
    for (const item of body.items) {
      if (!item.equipment || !item.quantity || item.quantity < 1 || !item.condition) {
        return new NextResponse(JSON.stringify({ 
          error: 'Each item must have an equipment ID, a positive quantity, and a condition'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check if equipment exists
      const equipment = await Equipment.findById(item.equipment);
      if (!equipment) {
        return new NextResponse(JSON.stringify({ 
          error: `Equipment not found for ID: ${item.equipment}`
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Validate rental details if transaction type is 'rental'
    if (body.transactionType === 'rental') {
      if (!body.rentalDetails || !body.rentalDetails.startDate || !body.rentalDetails.returnDueDate) {
        return new NextResponse(JSON.stringify({ 
          error: 'Rental transactions require startDate and returnDueDate'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const startDate = new Date(body.rentalDetails.startDate);
      const returnDueDate = new Date(body.rentalDetails.returnDueDate);
      
      if (isNaN(startDate.getTime()) || isNaN(returnDueDate.getTime())) {
        return new NextResponse(JSON.stringify({ 
          error: 'Invalid date format for rental dates'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (returnDueDate <= startDate) {
        return new NextResponse(JSON.stringify({ 
          error: 'Return due date must be after start date'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const transaction = new EquipmentTransaction(body);
    await transaction.save();
    
    // Populate references for response
    await transaction.populate('provider');
    await transaction.populate('recipient', 'name schoolId');
    await transaction.populate('items.equipment', 'name equipmentId');
    
    return new NextResponse(JSON.stringify(transaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating equipment transaction:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create equipment transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update an equipment transaction
export async function PATCH(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Transaction ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Find by _id or transactionId
    const existingTransaction = await EquipmentTransaction.findOne({
      $or: [{ _id: id }, { transactionId: id }]
    });
    
    if (!existingTransaction) {
      return new NextResponse(JSON.stringify({ error: 'Equipment transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prevent changing provider or recipient after creation
    if (body.provider && body.provider.toString() !== existingTransaction.provider.toString()) {
      return new NextResponse(JSON.stringify({ error: 'Cannot change provider after transaction creation' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (body.recipient && body.recipient.toString() !== existingTransaction.recipient.toString()) {
      return new NextResponse(JSON.stringify({ error: 'Cannot change recipient after transaction creation' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (body.providerType && body.providerType !== existingTransaction.providerType) {
      return new NextResponse(JSON.stringify({ error: 'Cannot change provider type after transaction creation' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Special handling for status changes
    if (body.status && body.status !== existingTransaction.status) {
      // Only allow specific status transitions
      const validTransitions: Record<string, string[]> = {
        'pending': ['approved', 'rejected', 'cancelled'],
        'approved': ['completed', 'cancelled'],
        'rejected': [],
        'completed': [],
        'cancelled': [],
        'returned': []
      };
      
      if (!validTransitions[existingTransaction.status].includes(body.status)) {
        return new NextResponse(JSON.stringify({ 
          error: `Cannot change status from '${existingTransaction.status}' to '${body.status}'` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Set approvedAt and approvedBy when status changes to approved
      if (body.status === 'approved') {
        body.approvedAt = new Date();
        
        // Require approvedBy for approval
        if (!body.approvedBy && !existingTransaction.approvedBy) {
          return new NextResponse(JSON.stringify({ 
            error: 'approvedBy is required when approving a transaction' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // If rental is being returned, ensure returnedDate is set
      if (body.status === 'returned' && existingTransaction.transactionType === 'rental') {
        if (!body.rentalDetails?.returnedDate && !existingTransaction.rentalDetails?.returnedDate) {
          body.rentalDetails = {
            ...existingTransaction.rentalDetails,
            ...body.rentalDetails,
            returnedDate: new Date()
          };
        }
      }
    }
    
    // Update the transaction
    const updatedTransaction = await EquipmentTransaction.findOneAndUpdate(
      { $or: [{ _id: id }, { transactionId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    )
    .populate('provider')
    .populate('recipient', 'name schoolId')
    .populate('items.equipment', 'name equipmentId')
    .populate('approvedBy', 'fullName email');
    
    return new NextResponse(JSON.stringify(updatedTransaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating equipment transaction:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update equipment transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete an equipment transaction
export async function DELETE(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Transaction ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Only allow deletion of pending transactions
    const transaction = await EquipmentTransaction.findOne({
      $or: [{ _id: id }, { transactionId: id }]
    });
    
    if (!transaction) {
      return new NextResponse(JSON.stringify({ error: 'Equipment transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if transaction is not in pending status
    if (transaction.status !== 'pending') {
      return new NextResponse(JSON.stringify({ 
        error: 'Only pending transactions can be deleted' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete the transaction
    await EquipmentTransaction.findOneAndDelete({
      $or: [{ _id: id }, { transactionId: id }]
    });
    
    return new NextResponse(JSON.stringify({ 
      message: 'Equipment transaction deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting equipment transaction:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete equipment transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}