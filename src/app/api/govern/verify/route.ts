import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import GovernBody from '@/model/governBodySchema';
import { sendGovernBodyRegistrationNotificationEmail } from '@/utils/emailService';

// POST endpoint for code verification
export async function POST(request: NextRequest) {
  let connection = null;
  try {
    // Connect directly using Mongoose with robust options
    connection = await mongoose.connect(process.env.MONGO_DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
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

    // Find governing body with matching email and verification code that hasn't expired
    const governBody = await GovernBody.findOne({
      email: email,
      verificationToken: code,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!governBody) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid or expired verification code' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update governing body to verified status
    await GovernBody.updateOne(
      { _id: governBody._id },
      { 
        $set: { 
          verified: true,
          adminVerified: false // Explicitly set adminVerified to false
        },
        $unset: { verificationToken: "", verificationTokenExpiry: "" }
      }
    );

    // Send registration notification email
    try {
      await sendGovernBodyRegistrationNotificationEmail(email, governBody.name);
    } catch (emailError) {
      console.warn('Registration notification email could not be sent, but verification was successful:', emailError);
    }

    // Return success
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Email verified successfully. Your account is pending admin review.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error verifying governing body email:', error);
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