import { NextRequest, NextResponse } from 'next/server';
import Play from '@/model/playSchema';
import mongoose from 'mongoose';
import { ensureConnection } from '@/utils/connectionManager';

// GET endpoint - fetch plays
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('school');
    const sportId = searchParams.get('sport');
    const isActive = searchParams.get('active');

    // If ID is provided, fetch specific play
    if (id) {
      const play = await Play.findOne({ 
        $or: [{ _id: id }, { playId: id }] 
      }).populate('school', 'name schoolId').populate('sport', 'sportName sportId');
      
      if (!play) {
        return new NextResponse(JSON.stringify({ error: 'Play relationship not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(play), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (schoolId) query.school = schoolId;
    if (sportId) query.sport = sportId;
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Fetch plays with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const plays = await Play.find(query)
      .populate('school', 'name schoolId')
      .populate('sport', 'sportName sportId')
      .skip(skip)
      .limit(limit)
      .sort({ lastUpdated: -1 });
    
    const total = await Play.countDocuments(query);

    return new NextResponse(JSON.stringify({
      plays,
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
    console.error('Error fetching plays:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch plays' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new play
export async function POST(request: NextRequest) {
  try {  
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const body = await request.json();
    
    // Validate required fields
    if (!body.school || !body.sport) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['school', 'sport'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const play = new Play(body);
    await play.save();
    
    // Populate references for response
    await play.populate('school', 'name schoolId');
    await play.populate('sport', 'sportName sportId');
    
    return new NextResponse(JSON.stringify(play), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating play:', error);
    
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
    
    // Handle duplicate key error (school already plays this sport)
    if (error.code === 11000) {
      return new NextResponse(JSON.stringify({ 
        error: 'This school already has this sport registered',
        field: Object.keys(error.keyPattern)[0]
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create play relationship' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update a play
export async function PATCH(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Play ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Find by _id or playId
    const play = await Play.findOneAndUpdate(
      { $or: [{ _id: id }, { playId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    ).populate('school', 'name schoolId').populate('sport', 'sportName sportId');
    
    if (!play) {
      return new NextResponse(JSON.stringify({ error: 'Play relationship not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify(play), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating play:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle duplicate key error if school/sport combination already exists
    if (error.code === 11000) {
      return new NextResponse(JSON.stringify({ 
        error: 'This school already has this sport registered',
        field: Object.keys(error.keyPattern)[0]
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update play relationship' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete a play
export async function DELETE(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Play ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find by _id or playId
    const deletedPlay = await Play.findOneAndDelete(
      { $or: [{ _id: id }, { playId: id }] }
    );
    
    if (!deletedPlay) {
      return new NextResponse(JSON.stringify({ error: 'Play relationship not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      message: 'Play relationship deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting play:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete play relationship' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}