import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Logout failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const handleLogout = async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    
    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};