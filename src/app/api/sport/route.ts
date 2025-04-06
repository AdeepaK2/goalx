import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/database';
import Sport from '@/model/sportSchema';
import mongoose from 'mongoose';

// GET endpoint - fetch sports
export async function GET(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const category = searchParams.get('category');

    // If ID is provided, fetch specific sport
    if (id) {
      const sport = await Sport.findOne({ 
        $or: [{ _id: id }, { sportId: id }] 
      });
      
      if (!sport) {
        return new NextResponse(JSON.stringify({ error: 'Sport not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(sport), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (name) query.sportName = { $regex: name, $options: 'i' };
    if (category) query.categories = { $in: [category] };

    // Fetch sports with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const sports = await Sport.find(query)
      .skip(skip)
      .limit(limit);
    
    const total = await Sport.countDocuments(query);

    return new NextResponse(JSON.stringify({
      sports,
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
    console.error('Error fetching sports:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch sports' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new sport
export async function POST(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const body = await request.json();
    
    const sport = new Sport(body);
    await sport.save();
    
    return new NextResponse(JSON.stringify(sport), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating sport:', error);
    
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
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create sport' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update a sport
export async function PATCH(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Sport ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Find by _id or sportId
    const sport = await Sport.findOneAndUpdate(
      { $or: [{ _id: id }, { sportId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!sport) {
      return new NextResponse(JSON.stringify({ error: 'Sport not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify(sport), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating sport:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update sport' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete a sport
export async function DELETE(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Sport ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find by _id or sportId
    const deletedSport = await Sport.findOneAndDelete(
      { $or: [{ _id: id }, { sportId: id }] }
    );
    
    if (!deletedSport) {
      return new NextResponse(JSON.stringify({ error: 'Sport not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      message: 'Sport deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting sport:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete sport' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}