import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('adminToken')?.value;
  const { pathname } = request.nextUrl;
  
  // Check if the request is for an admin page (excluding login)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.includes('/admin/login');
  
  // If accessing admin routes without token, redirect to login
  if (isAdminRoute && !adminToken) {
    const url = new URL('/admin/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // If already logged in and trying to access login page, redirect to dashboard
  if (pathname === '/admin/login' && adminToken) {
    try {
      // Verify token
      const JWT_SECRET = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
      );
      await jwtVerify(adminToken, JWT_SECRET);
      
      // Token is valid, redirect to dashboard
      const url = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(url);
    } catch (error) {
      // Token verification failed, allow access to login page
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};