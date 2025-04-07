import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Donor from '@/model/donorSchema';
import { generateVerificationToken, sendVerificationEmail } from '@/utils/emailService';

// GET endpoint - fetch donors
export async function GET(request: NextRequest) {
  try {
    // Connect directly using Mongoose
    await mongoose.connect(process.env.MONGO_DB_URI as string);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const donorType = searchParams.get('type');
    const verified = searchParams.get('verified');

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
    if (verified !== null && verified !== undefined) {
      query.verified = verified === 'true';
    }

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
  } finally {
    // Disconnect after operation
    await mongoose.disconnect();
  }
}

// POST endpoint - create a new donor
export async function POST(request: NextRequest) {
  try {
    // Connect directly using Mongoose
    await mongoose.connect(process.env.MONGO_DB_URI as string);

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
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
    
    const donor = new Donor({
      ...body,
      verificationToken,
      verificationTokenExpiry
    });
    
    await donor.save();
    
    // Send verification email
    await sendVerificationEmail(donor.email, verificationToken, donor.displayName);
    
    // Return created donor without password
    const { password, verificationToken: vt, verificationTokenExpiry: vte, ...donorObject } = donor.toObject();
    
    return new NextResponse(JSON.stringify({
      ...donorObject,
      message: 'Registration successful! Please check your email to verify your account.'
    }), {
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
  } finally {
    // Disconnect after operation
    await mongoose.disconnect();
  }
}

// PATCH endpoint - update a donor
export async function PATCH(request: NextRequest) {
  try {
    // Connect directly using Mongoose
    await mongoose.connect(process.env.MONGO_DB_URI as string);

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
  } finally {
    // Disconnect after operation
    await mongoose.disconnect();
  }
}

// DELETE endpoint - delete a donor
export async function DELETE(request: NextRequest) {
  try {
    // Connect directly using Mongoose
    await mongoose.connect(process.env.MONGO_DB_URI as string);

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
  } finally {
    // Disconnect after operation
    await mongoose.disconnect();
  }
}