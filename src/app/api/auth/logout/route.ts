import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json().catch(() => ({}));
    const userType = requestBody.userType || 'unknown';
    
    // Create response object first
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear token based on user type or clear all possible tokens if type unknown
    if (userType === 'school') {
      response.cookies.delete('auth_token');
      console.log('School token cleared');
    } else if (userType === 'donor') {
      response.cookies.delete('donor_token');
      console.log('Donor token cleared');
    } else if (userType === 'governBody') {
      response.cookies.delete('govern_token');
      console.log('Govern body token cleared');
    } else {
      // If userType not specified, clear all possible tokens
      response.cookies.delete('auth_token');
      response.cookies.delete('donor_token');
      response.cookies.delete('govern_token');
      console.log('All tokens cleared');
    }
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Logout failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}