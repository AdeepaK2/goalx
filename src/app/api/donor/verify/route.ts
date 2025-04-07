import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Donor from '@/model/donorSchema';

// The GET route will be deprecated in favor of the POST route
export async function GET(request: NextRequest) {
  return new NextResponse(JSON.stringify({
    error: 'Please use the verification page to enter your code'
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// New POST endpoint for code verification
export async function POST(request: NextRequest) {
  try {
    // Connect directly using Mongoose
    await mongoose.connect(process.env.MONGO_DB_URI as string);
    
    // Get verification code and email from request body
    const body = await request.json();
    const { email, code } = body;
    
    if (!email || !code) {
      return new NextResponse(JSON.stringify({ 
        error: 'Email and verification code are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find donor with matching email and verification code that hasn't expired
    const donor = await Donor.findOne({
      email: email,
      verificationToken: code,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!donor) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid or expired verification code' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update donor to verified status
    donor.verified = true;
    donor.verificationToken = undefined;
    donor.verificationTokenExpiry = undefined;
    await donor.save();

    // Return success
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Email verified successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error verifying donor email:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to verify email' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await mongoose.disconnect();
  }
}