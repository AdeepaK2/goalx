import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import School from '@/model/schoolSchema';
import { sendWelcomeEmail, sendSchoolRegistrationNotificationEmail } from '@/utils/emailService';

// The GET route will be deprecated in favor of the POST route
export async function GET(request: NextRequest) {
  return new NextResponse(JSON.stringify({
    error: 'Please use the verification page to enter your code'
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST endpoint for code verification
export async function POST(request: NextRequest) {
  let connection = null;
  try {
    // Connect directly using Mongoose with more robust options
    connection = await mongoose.connect(process.env.MONGO_DB_URI as string, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
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

    // Find school with matching email and verification code that hasn't expired
    const school = await School.findOne({
      'contact.email': email,
      verificationToken: code,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!school) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid or expired verification code' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // FIX: Only update specific fields instead of the entire document
    // This avoids triggering validation on fields we're not changing
    // For schools, we set verified=true but adminVerified=false
    await School.updateOne(
      { _id: school._id },
      { 
        $set: { 
          verified: true,
          adminVerified: false // Explicitly set adminVerified to false
        },
        $unset: { verificationToken: "", verificationTokenExpiry: "" }
      }
    );

    // Send "pending admin review" email
    try {
      await sendSchoolRegistrationNotificationEmail(email, school.name);
    } catch (emailError) {
      console.warn('Registration notification email could not be sent, but verification was successful:', emailError);
    }

    // Return success with specific message for schools
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'School email verified successfully. Your account is pending admin review.',
      adminVerificationRequired: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error verifying school email:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to verify email' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    // Safely disconnect if connected
    if (connection) {
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.warn('Error disconnecting from MongoDB:', disconnectError);
      }
    }
  }
}