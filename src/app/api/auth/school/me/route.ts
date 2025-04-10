import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import School from '@/model/schoolSchema';
import { ensureConnection } from '@/utils/connectionManager';

export async function GET(request: NextRequest) {
  try {
    // Get auth cookie
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Verify token
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
    );
    
    const { payload } = await jwtVerify(authToken, JWT_SECRET);
    
    if (!payload.id || payload.role !== 'school') {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 401 });
    }
    
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
    // Find school by id
    const school = await School.findById(payload.id).select('-password');
    
    if (!school) {
      return NextResponse.json({ 
        error: 'School not found' 
      }, { status: 404 });
    }
    
    // Return school info
    return NextResponse.json({
      success: true,
      school: {
        id: school._id,
        schoolId: school.schoolId,
        name: school.name,
        email: school.contact?.email
      }
    });
  } catch (error) {
    console.error('Error fetching current school:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}