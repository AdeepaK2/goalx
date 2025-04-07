import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect, disconnect } from '@/utils/database';
import Admin from '@/model/siteAdminSchema';
import bcrypt from 'bcryptjs';

// GET all admins
export async function GET(req: NextRequest) {
  try {
    // Check if request includes an id parameter for getting a specific admin
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    await connect();
    
    if (id) {
      // Get specific admin by ID
      const admin = await Admin.findById(id).select('-password');
      
      if (!admin) {
        return NextResponse.json(
          { error: 'Admin not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(admin);
    } else {
      // Get all admins
      const admins = await Admin.find().select('-password');
      return NextResponse.json(admins);
    }
  } catch (error) {
    console.error('Error in GET admin:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve admin(s)' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
}

// POST - Create a new admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    
    try {
      await connect();
    } catch (connectionError) {
      console.error('MongoDB connection error:', connectionError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check network access and MongoDB Atlas whitelist settings.' },
        { status: 500 }
      );
    }
    
    // Check if admin with the same email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create a new admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword
    });
    
    await admin.save();
    
    // Return the created admin without password
    const adminResponse = admin.toObject() as Record<string, any>;
    delete adminResponse.password;
    
    return NextResponse.json(adminResponse, { status: 201 });
  } catch (error) {
    console.error('Error in POST admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
}

// PATCH - Update an admin
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const updateData = { ...body };
    
    // If updating password, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    await connect();
    
    // Find and update the admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Error in PATCH admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
}

// DELETE - Remove an admin
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
    await connect();
    
    // Find and delete the admin
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    
    if (!deletedAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Admin deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
}