import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Get path
  const path = request.nextUrl.pathname;
  
  // Define protected routes
  const isAdminRoute = path === '/admin' || (path.startsWith('/admin') && !path.startsWith('/admin/login'));
  
  if (isAdminRoute) {
    // Get token from Cookie or Authorization header
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      // Verify token
      verify(token, process.env.JWT_SECRET || 'fallback_secret');
      return NextResponse.next();
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};