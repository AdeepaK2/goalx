import { NextRequest, NextResponse } from 'next/server';
import EquipmentRequest from '@/model/equipmentRequestSchema';
import mongoose from 'mongoose';
import { ensureConnection } from '@/utils/connectionManager';

// GET endpoint - fetch equipment requests
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('school');
    const status = searchParams.get('status');
    const equipmentId = searchParams.get('equipment');
    const startDateFrom = searchParams.get('startDateFrom');
    const startDateTo = searchParams.get('startDateTo');

    // If ID is provided, fetch specific equipment request
    if (id) {
      const equipmentRequest = await EquipmentRequest.findOne({ 
        $or: [{ _id: id }, { requestId: id }] 
      })
      .populate('school', 'name schoolId')
      .populate('items.equipment', 'name equipmentId');
      
      if (!equipmentRequest) {
        return new NextResponse(JSON.stringify({ error: 'Equipment request not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(equipmentRequest), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (schoolId) query.school = schoolId;
    if (status) query.status = status;
    if (equipmentId) query['items.equipment'] = equipmentId;
    
    // Handle date range for event start date
    if (startDateFrom || startDateTo) {
      query.eventStartDate = {};
      if (startDateFrom) query.eventStartDate.$gte = new Date(startDateFrom);
      if (startDateTo) query.eventStartDate.$lte = new Date(startDateTo);
    }

    // Fetch equipment requests with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const equipmentRequests = await EquipmentRequest.find(query)
      .populate('school', 'name schoolId')
      .populate('items.equipment', 'name equipmentId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await EquipmentRequest.countDocuments(query);

    return new NextResponse(JSON.stringify({
      equipmentRequests,
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
    console.error('Error fetching equipment requests:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch equipment requests' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new equipment request
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const body = await request.json();
    
    // Validate required fields
    if (!body.school || !body.eventName || !body.eventDescription || !body.items || body.items.length === 0) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['school', 'eventName', 'eventDescription', 'items (non-empty array)'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate items array
    for (const item of body.items) {
      if (!item.equipment || !item.quantityRequested || item.quantityRequested < 1) {
        return new NextResponse(JSON.stringify({ 
          error: 'Each item must have an equipment ID and a positive quantityRequested',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Validate dates if provided
    if (body.eventStartDate) {
      const startDate = new Date(body.eventStartDate);
      if (isNaN(startDate.getTime()) || startDate < new Date()) {
        return new NextResponse(JSON.stringify({ 
          error: 'Event start date must be valid and in the future',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (body.eventEndDate) {
        const endDate = new Date(body.eventEndDate);
        if (isNaN(endDate.getTime()) || endDate < startDate) {
          return new NextResponse(JSON.stringify({ 
            error: 'Event end date must be valid and after start date',
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    const equipmentRequest = new EquipmentRequest(body);
    await equipmentRequest.save();
    
    // Populate references for response
    await equipmentRequest.populate('school', 'name schoolId');
    await equipmentRequest.populate('items.equipment', 'name equipmentId');
    
    return new NextResponse(JSON.stringify(equipmentRequest), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating equipment request:', error);
    
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
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create equipment request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update an equipment request
export async function PATCH(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Equipment request ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Create a proper query that avoids ObjectId casting errors
    const query: any = { requestId: id };
    
    // Only add _id to query if it's a valid ObjectId format (24 char hex)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query.$or = [{ _id: id }, { requestId: id }];
    }
    
    // Find the request
    const existingRequest = await EquipmentRequest.findOne(query);
    
    if (!existingRequest) {
      return new NextResponse(JSON.stringify({ error: 'Equipment request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Make sure all updated items have valid equipment references
    if (body.items) {
      for (const item of body.items) {
        if (!item.equipment) {
          return new NextResponse(JSON.stringify({ 
            error: 'Each item must have an equipment reference' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Update the request with proper validation
    try {
      const updatedRequest = await EquipmentRequest.findOneAndUpdate(
        query,
        { $set: body },
        { new: true, runValidators: true }
      )
      .populate('school', 'name schoolId')
      .populate('items.equipment', 'name equipmentId');
      
      if (!updatedRequest) {
        return new NextResponse(JSON.stringify({ error: 'Failed to update equipment request' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(updatedRequest), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (validationError) {
      if (validationError instanceof mongoose.Error.ValidationError) {
        const errorDetails: Record<string, string> = {};
        
        // Format validation errors
        for (const field in validationError.errors) {
          errorDetails[field] = validationError.errors[field].message;
        }
        
        return new NextResponse(JSON.stringify({ 
          error: 'Validation error', 
          details: errorDetails
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error('Error updating equipment request:', error);
    
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to update equipment request',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete an equipment request
export async function DELETE(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Equipment request ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Only allow deletion of pending requests
    const equipmentRequest = await EquipmentRequest.findOne({
      $or: [{ _id: id }, { requestId: id }]
    });
    
    if (!equipmentRequest) {
      return new NextResponse(JSON.stringify({ error: 'Equipment request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if request is not in pending status
    if (equipmentRequest.status !== 'pending') {
      return new NextResponse(JSON.stringify({ 
        error: 'Only pending equipment requests can be deleted' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete the request
    const deletedRequest = await EquipmentRequest.findOneAndDelete({
      $or: [{ _id: id }, { requestId: id }]
    });
    
    return new NextResponse(JSON.stringify({ 
      message: 'Equipment request deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting equipment request:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete equipment request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}