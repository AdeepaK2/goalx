import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/database';
import mongoose from 'mongoose';
import GovernBody from '@/model/governBodySchema';
import bcrypt from 'bcryptjs';

// GET all governing bodies or a specific one by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // Connect to database
    await connect();
    await mongoose.connect(process.env.MONGO_DB_URI!);
    
    // If ID is provided, return specific governing body
    if (id) {
      const governBody = await GovernBody.findOne({ governBodyId: id });
      
      if (!governBody) {
        return NextResponse.json(
          { error: 'Governing body not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(governBody);
    }
    
    // Otherwise return all governing bodies
    const governBodies = await GovernBody.find({});
    return NextResponse.json(governBodies);
    
  } catch (error: any) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch governing bodies' },
      { status: 500 }
    );
  }
}

// POST - Create a new governing body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Connect to database
    await connect();
    await mongoose.connect(process.env.MONGO_DB_URI!);
    
    // Hash password before saving
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }
    
    // Generate a unique governBodyId if not provided
    if (!body.governBodyId) {
      const count = await GovernBody.countDocuments();
      body.governBodyId = `GB${(count + 1).toString().padStart(4, '0')}`;
    }
    
    // Create new governing body
    const newGovernBody = new GovernBody(body);
    await newGovernBody.save();
    
    return NextResponse.json(
      { message: 'Governing body created successfully', data: newGovernBody },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error in POST request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create governing body' },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing governing body
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const updateData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Governing body ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connect();
    await mongoose.connect(process.env.MONGO_DB_URI!);
    
    // Hash password if it's being updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      updateData.passwordChangedAt = new Date();
    }
    
    const updatedGovernBody = await GovernBody.findOneAndUpdate(
      { governBodyId: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedGovernBody) {
      return NextResponse.json(
        { error: 'Governing body not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Governing body updated successfully',
      data: updatedGovernBody
    });
    
  } catch (error: any) {
    console.error('Error in PATCH request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update governing body' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a governing body
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Governing body ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connect();
    await mongoose.connect(process.env.MONGO_DB_URI!);
    
    const deletedGovernBody = await GovernBody.findOneAndDelete({ governBodyId: id });
    
    if (!deletedGovernBody) {
      return NextResponse.json(
        { error: 'Governing body not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Governing body deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Error in DELETE request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete governing body' },
      { status: 500 }
    );
  }
}