import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/database';
import Equipment from '@/model/equipmentSchema';
import mongoose from 'mongoose';

// GET endpoint - fetch equipment
export async function GET(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const sportId = searchParams.get('sport');

    // If ID is provided, fetch specific equipment
    if (id) {
      const equipment = await Equipment.findOne({ 
        $or: [{ _id: id }, { equipmentId: id }] 
      }).populate('sport', 'sportName sportId');
      
      if (!equipment) {
        return new NextResponse(JSON.stringify({ error: 'Equipment not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(equipment), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (sportId) query.sport = sportId;

    // Fetch equipment with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const equipmentList = await Equipment.find(query)
      .populate('sport', 'sportName sportId')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    const total = await Equipment.countDocuments(query);

    return new NextResponse(JSON.stringify({
      equipment: equipmentList,
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
    console.error('Error fetching equipment:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch equipment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create new equipment
export async function POST(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.sport) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['name', 'sport'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const equipment = new Equipment(body);
    await equipment.save();
    
    // Populate sport reference for response
    await equipment.populate('sport', 'sportName sportId');
    
    return new NextResponse(JSON.stringify(equipment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    
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
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return new NextResponse(JSON.stringify({ 
        error: 'Duplicate entry', 
        field: Object.keys(error.keyPattern)[0]
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create equipment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update equipment
export async function PATCH(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Equipment ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Find by _id or equipmentId
    const equipment = await Equipment.findOneAndUpdate(
      { $or: [{ _id: id }, { equipmentId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    ).populate('sport', 'sportName sportId');
    
    if (!equipment) {
      return new NextResponse(JSON.stringify({ error: 'Equipment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify(equipment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update equipment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete equipment
export async function DELETE(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Equipment ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find by _id or equipmentId
    const deletedEquipment = await Equipment.findOneAndDelete(
      { $or: [{ _id: id }, { equipmentId: id }] }
    );
    
    if (!deletedEquipment) {
      return new NextResponse(JSON.stringify({ error: 'Equipment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      message: 'Equipment deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete equipment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}