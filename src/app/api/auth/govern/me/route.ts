import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import GovernBody from '@/model/governBodySchema';
import { ensureConnection } from '@/utils/connectionManager';

export async function GET(request: NextRequest) {
  try {
    // Get govern token from cookie
    const governToken = request.cookies.get('govern_token')?.value;
    
    if (!governToken) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Verify token
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
    );
    
    const { payload } = await jwtVerify(governToken, JWT_SECRET);
    
    if (!payload.id || payload.role !== 'governBody') {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 401 });
    }
    
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
    // Find governing body by id
    const governBody = await GovernBody.findById(payload.id).select('-password');
    
    if (!governBody) {
      return NextResponse.json({ 
        error: 'Governing body not found' 
      }, { status: 404 });
    }
    
    // Return governing body info
    return NextResponse.json({
      success: true,
      governBody: {
        id: governBody._id,
        governBodyId: governBody.governBodyId,
        name: governBody.name,
        email: governBody.email
      }
    });
  } catch (error) {
    console.error('Error fetching current governing body:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}