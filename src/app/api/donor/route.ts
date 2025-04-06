import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/database';
import Donor from '@/model/donorSchema';
import mongoose from 'mongoose';

// GET endpoint - fetch donors
export async function GET(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const donorType = searchParams.get('type');
    const province = searchParams.get('province');
    const district = searchParams.get('district');

    // If ID is provided, fetch specific donor
    if (id) {
      const donor = await Donor.findOne({ 
        $or: [{ _id: id }, { donorId: id }] 
      }).select('-password');
      
      if (!donor) {
        return new NextResponse(JSON.stringify({ error: 'Donor not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(donor), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (name) query.displayName = { $regex: name, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (donorType && ['INDIVIDUAL', 'COMPANY'].includes(donorType.toUpperCase())) {
      query.donorType = donorType.toUpperCase();
    }
    if (province) query['address.province'] = province;
    if (district) query['address.district'] = district;

    // Fetch donors with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const donors = await Donor.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Donor.countDocuments(query);

    return new NextResponse(JSON.stringify({
      donors,
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
    console.error('Error fetching donors:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch donors' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new donor
export async function POST(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.displayName || !body.email || !body.password || !body.donorType) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['displayName', 'email', 'password', 'donorType'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate donor type
    if (!['INDIVIDUAL', 'COMPANY'].includes(body.donorType.toUpperCase())) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid donor type. Must be either INDIVIDUAL or COMPANY'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const donor = new Donor(body);
    await donor.save();
    
    // Return created donor without password
    const { password, ...donorObject } = donor.toObject();
    
    return new NextResponse(JSON.stringify(donorObject), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating donor:', error);
    
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
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create donor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update a donor
export async function PATCH(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Donor ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Don't allow changing donor type directly
    if (body.donorType) {
      delete body.donorType;
    }
    
    // Find by _id or donorId
    const donor = await Donor.findOneAndUpdate(
      { $or: [{ _id: id }, { donorId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!donor) {
      return new NextResponse(JSON.stringify({ error: 'Donor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify(donor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating donor:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle duplicate key error (e.g., if email already exists)
    if (error.code === 11000) {
      return new NextResponse(JSON.stringify({ 
        error: 'Duplicate entry', 
        field: Object.keys(error.keyPattern)[0]
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update donor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete a donor
export async function DELETE(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Donor ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find by _id or donorId
    const deletedDonor = await Donor.findOneAndDelete(
      { $or: [{ _id: id }, { donorId: id }] }
    );
    
    if (!deletedDonor) {
      return new NextResponse(JSON.stringify({ error: 'Donor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      message: 'Donor deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete donor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}