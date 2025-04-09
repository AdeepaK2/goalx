import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware running for path:', pathname);

  // Check if the request is for an admin page (excluding login)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.includes('/admin/login');
  
  // Check if the request is for a school page (excluding login)
  const isSchoolRoute = pathname.startsWith('/school') || pathname.startsWith('/schools');
  
  const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
  );

  // Handle admin routes
  if (isAdminRoute) {
    const adminToken = request.cookies.get('adminToken')?.value;
    
    // If accessing admin routes without token, redirect to login
    if (!adminToken) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify token
      const { payload } = await jwtVerify(adminToken, JWT_SECRET);
      
      // Check if token has admin role
      if (payload.role !== 'admin') {
        const url = new URL('/admin/login', request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Token verification failed, redirect to login
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Handle school routes
  if (isSchoolRoute) {
    console.log('Checking school route protection');
    const authToken = request.cookies.get('auth_token')?.value;
    console.log('Auth token present:', !!authToken);
    
    if (!authToken) {
      console.log('No auth token, redirecting to login');
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify token
      const { payload } = await jwtVerify(authToken, JWT_SECRET);
      console.log('Token verified successfully, role:', payload.role);
      
      // Check if token has school role
      if (payload.role !== 'school') {
        console.log('Invalid role in token:', payload.role);
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
      }
      
      console.log('Token validation successful, proceeding to school route');
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token verification failed, redirect to login
      const url = new URL('/login', request.url);
      const response = NextResponse.redirect(url);
      
      // Clear the invalid token
      response.cookies.delete('auth_token');
      
      return response;
    }
  }
  
  // If already logged in as admin and trying to access login page, redirect to dashboard
  if (pathname === '/admin/login') {
    const adminToken = request.cookies.get('adminToken')?.value;
    
    if (adminToken) {
      try {
        // Verify token
        await jwtVerify(adminToken, JWT_SECRET);
        
        // Token is valid, redirect to dashboard
        const url = new URL('/admin/dashboard', request.url);
        return NextResponse.redirect(url);
      } catch (error) {
        // Token verification failed, allow access to login page
        return NextResponse.next();
      }
    }
  }
  
  // If already logged in as school and trying to access login page, redirect to school dashboard
  if (pathname === '/login') {
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (authToken) {
      try {
        // Verify token
        const { payload } = await jwtVerify(authToken, JWT_SECRET);
        
        // Check if token has school role and redirect to appropriate dashboard
        if (payload.role === 'school') {
          const url = new URL('/schools', request.url);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        // Token verification failed, allow access to login page
        return NextResponse.next();
      }
    }
  }
  
  return NextResponse.next();
}

// Update matcher to include school routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/school/:path*',
    '/schools/:path*',
    '/login'
  ],
};