import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import GovernBody from '@/model/governBodySchema';
import Sport from '@/model/sportSchema';
import bcrypt from 'bcryptjs';
import { generateVerificationToken, sendGovernBodyVerificationEmail } from '@/utils/emailService';
import { ensureConnection } from '@/utils/connectionManager';

// GET all governing bodies or a specific one by ID
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
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
    
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
    // Generate a unique governBodyId if not provided
    if (!body.governBodyId) {
      const count = await GovernBody.countDocuments();
      body.governBodyId = `GB${(count + 1).toString().padStart(4, '0')}`;
    }
    
    // Generate verification token
    const verificationToken = await generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
    
    // Add verification fields to the body
    body.verified = false;
    body.adminVerified = false;
    body.verificationToken = verificationToken;
    body.verificationTokenExpiry = verificationTokenExpiry;
    
    // Create new governing body
    const newGovernBody = new GovernBody(body);
    await newGovernBody.save();
    
    // Send verification email
    await sendGovernBodyVerificationEmail(
      newGovernBody.email, 
      verificationToken, 
      newGovernBody.name
    );
    
    // Remove sensitive data before returning
    const { password, verificationToken: vToken, verificationTokenExpiry: vTokenExpiry, ...responseData } = newGovernBody.toObject();
    
    return NextResponse.json(
      { 
        message: 'Governing body created successfully! Please check your email to verify your account.', 
        data: responseData 
      },
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
    
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
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
    
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
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