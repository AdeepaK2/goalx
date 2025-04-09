import { NextRequest, NextResponse } from 'next/server';
import Donor from '@/model/donorSchema';
import { ensureConnection } from '@/utils/connectionManager';
// Use jose like in the school login route
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
    const { email, password } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Find donor by email
    const donor = await Donor.findOne({ email });
    
    if (!donor) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Check if donor email is verified
    if (!donor.verified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your email for verification link.' 
      }, { status: 401 });
    }
    
    // Compare passwords
    const isMatch = await donor.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Create JWT secret with TextEncoder - same as middleware
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
    );
    
    // Generate JWT token using jose
    const token = await new SignJWT({ 
      id: donor._id.toString(),
      donorId: donor.donorId,
      email: donor.email,
      role: 'donor'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .setIssuedAt()
      .sign(JWT_SECRET);
    
    // Create donor payload for response
    const donorForResponse = {
      id: donor._id,
      donorId: donor.donorId,
      name: donor.displayName,
      email: donor.email
    };
    
    // Create response object first
    const response = NextResponse.json({
      success: true,
      donor: donorForResponse
    });
    
    // Set HTTP-only cookie directly on the response object
    response.cookies.set({
      name: 'donor_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/'
    });
    
    console.log('Donor cookie set in response object');
    
    return response;
  } catch (error) {
    console.error('Donor login error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}