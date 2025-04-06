import { NextRequest, NextResponse } from 'next/server';
import {connect} from '@/utils/database';
import School from '@/model/schoolSchema';
import mongoose from 'mongoose';

// Connect to database
async function connectDB() {
  try {
    await connect();
  } catch (error) {
    console.error('Database connection failed:', error);
    return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET endpoint - fetch schools
export async function GET(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const name = searchParams.get('name');

    // If ID is provided, fetch specific school
    if (id) {
      const school = await School.findOne({ 
        $or: [{ _id: id }, { schoolId: id }, { sid: parseInt(id) }] 
      }).select('-password');
      
      if (!school) {
        return new NextResponse(JSON.stringify({ error: 'School not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(school), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (district) query['location.district'] = district;
    if (province) query['location.province'] = province;
    if (name) query.name = { $regex: name, $options: 'i' };

    // Fetch schools with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const schools = await School.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit);
    
    const total = await School.countDocuments(query);

    return new NextResponse(JSON.stringify({
      schools,
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
    console.error('Error fetching schools:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch schools' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new school
export async function POST(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const body = await request.json();
    
    const school = new School(body);
    await school.save();
    
    // Return created school without password
    const { password, ...schoolResponse } = school.toObject();
    
    return new NextResponse(JSON.stringify(schoolResponse), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating school:', error);
    
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
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create school' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update a school
export async function PATCH(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'School ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Don't allow direct password updates through PATCH
    if (body.password) {
      delete body.password;
    }
    
    // Find by _id, schoolId or sid
    const school = await School.findOneAndUpdate(
      { $or: [{ _id: id }, { schoolId: id }, { sid: parseInt(id) }] },
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!school) {
      return new NextResponse(JSON.stringify({ error: 'School not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify(school), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating school:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update school' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete a school
export async function DELETE(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'School ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find by _id, schoolId or sid
    const deletedSchool = await School.findOneAndDelete(
      { $or: [{ _id: id }, { schoolId: id }, { sid: parseInt(id) }] }
    );
    
    if (!deletedSchool) {
      return new NextResponse(JSON.stringify({ error: 'School not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      message: 'School deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete school' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}