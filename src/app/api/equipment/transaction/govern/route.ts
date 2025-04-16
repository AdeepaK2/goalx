import { NextRequest, NextResponse } from 'next/server';
import { ensureConnection } from '@/utils/connectionManager';
import GovernEquipTransaction from '@/model/governEquipTransaction';
import Equipment from '@/model/equipmentSchema';
import School from '@/model/schoolSchema';
import GovernBody from '@/model/governBodySchema';
import mongoose from 'mongoose';

// GET endpoint - fetch governing body equipment transactions
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const governBodyId = searchParams.get('governBody');
    const schoolId = searchParams.get('school');
    const status = searchParams.get('status');
    const transactionType = searchParams.get('transactionType');
    const equipmentId = searchParams.get('equipment');
    const startDateFrom = searchParams.get('startDateFrom');
    const startDateTo = searchParams.get('startDateTo');
    const returnDueDateFrom = searchParams.get('returnDueDateFrom');
    const returnDueDateTo = searchParams.get('returnDueDateTo');
    const requestRef = searchParams.get('requestReference');

    // If ID is provided, fetch specific transaction
    if (id) {
      const transaction = await GovernEquipTransaction.findOne({ 
        $or: [{ _id: id }, { transactionId: id }] 
      })
      .populate('governBody')
      .populate('school', 'name schoolId')
      .populate('items.equipment', 'name equipmentId')
      .populate('approvedBy', 'fullName email');
      
      if (!transaction) {
        return new NextResponse(JSON.stringify({ error: 'Governing body transaction not found' }), {
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
    
    // Governing body filter
    if (governBodyId) query.governBody = governBodyId;
    
    // Other filters
    if (schoolId) query.school = schoolId;
    if (status) query.status = status;
    if (transactionType) query.transactionType = transactionType;
    if (equipmentId) query['items.equipment'] = equipmentId;
    if (requestRef) query.requestReference = requestRef;
    
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

    const transactions = await GovernEquipTransaction.find(query)
      .populate('governBody')
      .populate('school', 'name schoolId')
      .populate('items.equipment', 'name equipmentId')
      .populate('approvedBy', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await GovernEquipTransaction.countDocuments(query);

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
    console.error('Error fetching governing body transactions:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch governing body transactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new governing body to school equipment transaction
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const body = await request.json();
    
    // Validate required fields
    if (!body.governBody || !body.school || !body.transactionType || !body.items || body.items.length === 0) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['governBody', 'school', 'transactionType', 'items (non-empty array)'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if governing body exists
    const governBody = await GovernBody.findById(body.governBody);
    if (!governBody) {
      return new NextResponse(JSON.stringify({ 
        error: 'Governing body not found with the given ID'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if recipient school exists
    const school = await School.findById(body.school);
    if (!school) {
      return new NextResponse(JSON.stringify({ 
        error: 'School not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate items array
    for (const item of body.items) {
      // Support both equipmentId and equipment field names
      const equipmentId = item.equipment || item.equipmentId;
      
      if (!equipmentId || !item.quantity || item.quantity < 1 || !item.condition) {
        return new NextResponse(JSON.stringify({ 
          error: 'Each item must have an equipment ID, a positive quantity, and a condition'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check if equipment exists
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        return new NextResponse(JSON.stringify({ 
          error: `Equipment not found for ID: ${equipmentId}`
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Normalize to equipment field
      item.equipment = equipmentId;
      // Remove equipmentId if it exists to prevent duplication
      if (item.equipmentId) delete item.equipmentId;
    }
    
    // Validate rental details if transaction type is 'rental'
    if (body.transactionType === 'rental') {
      // Support both rentalDates array and rentalDetails object
      if (body.rentalDates && Array.isArray(body.rentalDates) && body.rentalDates.length === 2) {
        body.rentalDetails = {
          startDate: new Date(body.rentalDates[0]),
          returnDueDate: new Date(body.rentalDates[1]),
          rentalFee: body.rentalFee || 0
        };
        
        // Remove the non-schema fields
        delete body.rentalDates;
        delete body.rentalFee;
      } else if (!body.rentalDetails || !body.rentalDetails.startDate || !body.rentalDetails.returnDueDate) {
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

    // Create transaction document
    const transactionData = {
      governBody: body.governBody,
      school: body.school,
      transactionType: body.transactionType,
      items: body.items,
      status: body.status || 'pending',
      additionalNotes: body.additionalNotes || body.notes, // Support both field names
      termsAndConditions: body.termsAndConditions || 'Standard terms apply',
      requestReference: body.requestId || body.requestReference, // Support both field names
      rentalDetails: body.rentalDetails,
      approvedBy: undefined as any,
      approvedAt: undefined as Date | undefined
    };
    
    if (body.approvedBy) {
      transactionData.approvedBy = body.approvedBy;
      if (transactionData.status === 'approved') {
        transactionData.approvedAt = new Date();
      }
    }
    
    const transaction = new GovernEquipTransaction(transactionData);
    await transaction.save();
    
    // Populate references for response
    await transaction.populate('governBody');
    await transaction.populate('school', 'name schoolId');
    await transaction.populate('items.equipment', 'name equipmentId');
    
    return new NextResponse(JSON.stringify(transaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating governing body transaction:', error);
    
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
    
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to create governing body transaction',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update a governing body transaction
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
    const existingTransaction = await GovernEquipTransaction.findOne({
      $or: [{ _id: id }, { transactionId: id }]
    });
    
    if (!existingTransaction) {
      return new NextResponse(JSON.stringify({ error: 'Governing body transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prevent changing governBody or school after creation
    if (body.governBody && body.governBody.toString() !== existingTransaction.governBody.toString()) {
      return new NextResponse(JSON.stringify({ error: 'Cannot change governing body after transaction creation' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (body.school && body.school.toString() !== existingTransaction.school.toString()) {
      return new NextResponse(JSON.stringify({ error: 'Cannot change recipient school after transaction creation' }), {
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
    const updatedTransaction = await GovernEquipTransaction.findOneAndUpdate(
      { $or: [{ _id: id }, { transactionId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    )
    .populate('governBody')
    .populate('school', 'name schoolId')
    .populate('items.equipment', 'name equipmentId')
    .populate('approvedBy', 'fullName email');
    
    return new NextResponse(JSON.stringify(updatedTransaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating governing body transaction:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update governing body transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete a governing body transaction (only pending allowed)
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
    const transaction = await GovernEquipTransaction.findOne({
      $or: [{ _id: id }, { transactionId: id }]
    });
    
    if (!transaction) {
      return new NextResponse(JSON.stringify({ error: 'Governing body transaction not found' }), {
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
    await GovernEquipTransaction.findOneAndDelete({
      $or: [{ _id: id }, { transactionId: id }]
    });
    
    return new NextResponse(JSON.stringify({ 
      message: 'Governing body transaction deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting governing body transaction:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete governing body transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}