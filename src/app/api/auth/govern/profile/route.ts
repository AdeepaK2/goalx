import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import GovernBody from '@/model/governBodySchema';
import { ensureConnection } from '@/utils/connectionManager';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;
    
    // Get token from cookies
    const governToken = request.cookies.get('govern_token')?.value;
    
    if (!governToken) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Create JWT secret with TextEncoder - same as middleware
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
    );
    
    try {
      // Verify token
      const { payload } = await jwtVerify(governToken, JWT_SECRET);
      
      // Check if token has governBody role
      if (payload.role !== 'governBody') {
        return NextResponse.json({ 
          error: 'Invalid authentication credentials' 
        }, { status: 401 });
      }
      
      // Get govern body details from ID in token
      const governBodyId = payload.governBodyId;
      const governBody = await GovernBody.findOne({ governBodyId });
      
      if (!governBody) {
        return NextResponse.json({ 
          error: 'Governing body not found' 
        }, { status: 404 });
      }
      
      // Create govern body payload for response
      const governBodyForResponse = {
        id: governBody._id,
        governBodyId: governBody.governBodyId,
        name: governBody.name,
        email: governBody.email,
        description: governBody.description,
        logoUrl: governBody.logoUrl,
        specializedSports: governBody.specializedSports
      };
      
      return NextResponse.json({
        success: true,
        governBody: governBodyForResponse
      });
      
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ 
        error: 'Invalid or expired token'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error getting govern body profile:', error);
    return NextResponse.json({ 
      error: 'Failed to get profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}