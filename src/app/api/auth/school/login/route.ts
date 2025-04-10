import { NextRequest, NextResponse } from 'next/server';
import School from '@/model/schoolSchema';
import { ensureConnection } from '@/utils/connectionManager';
// Replace jsonwebtoken with jose
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
    
    // Find school by email
    const school = await School.findOne({ 'contact.email': email });
    
    if (!school) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Check if school email is verified
    if (!school.verified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your email for verification link.' 
      }, { status: 401 });
    }
    
    // Compare passwords
    const isMatch = await school.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Create JWT secret with TextEncoder - same as middleware
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
    );
    
    // Generate JWT token using jose instead of jsonwebtoken
    const token = await new SignJWT({ 
      id: school._id.toString(),
      schoolId: school.schoolId,
      email: school.contact.email,
      role: 'school'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .setIssuedAt()
      .sign(JWT_SECRET);
    
    // Create school payload for response
    const schoolForResponse = {
      id: school._id,
      schoolId: school.schoolId,
      name: school.name,
      email: school.contact.email
    };
    
    // Create response object first
    const response = NextResponse.json({
      success: true,
      school: schoolForResponse
    });
    
    // Set HTTP-only cookie directly on the response object
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/'
    });
    
    console.log('Cookie set in response object');
    
    return response;
  } catch (error) {
    console.error('School login error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}