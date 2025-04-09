import { NextRequest, NextResponse } from 'next/server';
import GovernBody from '@/model/governBodySchema';
import { ensureConnection } from '@/utils/connectionManager';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

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
    
    // Find governing body by email
    const governBody = await GovernBody.findOne({ email }).select('+password');
    
    if (!governBody) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Check if govern body is verified
    if (!governBody.verified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your email for verification link.' 
      }, { status: 401 });
    }
    
    // Check if govern body is admin verified
    if (!governBody.adminVerified) {
      return NextResponse.json({ 
        error: 'Your account is pending approval from an administrator.' 
      }, { status: 401 });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, governBody.password);
    
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
      id: governBody._id.toString(),
      governBodyId: governBody.governBodyId,
      email: governBody.email,
      role: 'governBody'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .setIssuedAt()
      .sign(JWT_SECRET);
    
    // Create govern body payload for response
    const governBodyForResponse = {
      id: governBody._id,
      governBodyId: governBody.governBodyId,
      name: governBody.name,
      email: governBody.email
    };
    
    // Create response object first
    const response = NextResponse.json({
      success: true,
      governBody: governBodyForResponse
    });
    
    // Set HTTP-only cookie directly on the response object
    response.cookies.set({
      name: 'govern_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/'
    });
    
    console.log('Govern Body cookie set in response object');
    
    return response;
  } catch (error) {
    console.error('Govern Body login error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}