import { NextRequest, NextResponse } from 'next/server';
import { connect, disconnect } from '@/utils/database';
import Admin from '@/model/siteAdminSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_this_in_production';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    await connect();
    
    // Find admin by email
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create admin payload (don't include password)
    const adminForToken = {
      id: admin._id,
      name: admin.name,
      email: admin.email
    };
    
    // Generate JWT token
    const token = jwt.sign(
      adminForToken,
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Create response object
    const response = NextResponse.json({
      success: true,
      admin: adminForToken
    });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: 'adminToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  } finally {
    await disconnect();
  }
}

// Endpoint to verify token
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('adminToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name: string;
      email: string;
    };
    
    // Return admin info without exposing sensitive information
    return NextResponse.json({
      authenticated: true,
      admin: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    // Clear the invalid cookie
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
    response.cookies.delete('adminToken');
    return response;
  }
}

// Logout endpoint
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful'
  });
  
  // Clear admin token cookie
  response.cookies.delete('adminToken');
  
  return response;
}