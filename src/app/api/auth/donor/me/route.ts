import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import Donor from '@/model/donorSchema';
import { ensureConnection } from '@/utils/connectionManager';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    // Get donor token from cookies
    const donorToken = request.cookies.get('donor_token')?.value;
    
    if (!donorToken) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }
    
    // Create JWT secret with TextEncoder - same as middleware
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
    );
    
    // Verify the token
    const { payload } = await jwtVerify(donorToken, JWT_SECRET);
    
    if (payload.role !== 'donor' || !payload.id) {
      return NextResponse.json({ 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    // Fetch the donor information
    const donor = await Donor.findById(payload.id).select('-password');
    
    if (!donor) {
      return NextResponse.json({ 
        error: 'Donor not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      id: donor._id,
      donorId: donor.donorId,
      name: donor.displayName,
      email: donor.email,
      donorType: donor.donorType
    });
  } catch (error) {
    console.error('Error fetching authenticated donor:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}