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
  
  // Check if the request is for a donor page
  const isDonorRoute = pathname.startsWith('/donor') || pathname.startsWith('/donors');
  
  // Check if the request is for a governing body page - ADD THE NEW PATH HERE
  const isGovernBodyRoute = pathname.startsWith('/govern-bodies') || pathname.startsWith('/governBody') || pathname.startsWith('/govern');
  
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
  
  // Handle donor routes
  if (isDonorRoute) {
    console.log('Checking donor route protection');
    const donorToken = request.cookies.get('donor_token')?.value;
    console.log('Donor token present:', !!donorToken);
    
    if (!donorToken) {
      console.log('No donor token, redirecting to login');
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify token
      const { payload } = await jwtVerify(donorToken, JWT_SECRET);
      console.log('Donor token verified successfully, role:', payload.role);
      
      // Check if token has donor role
      if (payload.role !== 'donor') {
        console.log('Invalid role in token:', payload.role);
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
      }
      
      console.log('Donor token validation successful, proceeding to donor route');
    } catch (error) {
      console.error('Donor token verification failed:', error);
      // Token verification failed, redirect to login
      const url = new URL('/login', request.url);
      const response = NextResponse.redirect(url);
      
      // Clear the invalid token
      response.cookies.delete('donor_token');
      
      return response;
    }
  }
  
  // Handle governing body routes
  if (isGovernBodyRoute) {
    console.log('Checking governing body route protection');
    const governToken = request.cookies.get('govern_token')?.value;
    console.log('Govern token present:', !!governToken);
    
    if (!governToken) {
      console.log('No govern token, redirecting to login');
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify token
      const { payload } = await jwtVerify(governToken, JWT_SECRET);
      console.log('Govern token verified successfully, role:', payload.role);
      
      // Check if token has governBody role
      if (payload.role !== 'governBody') {
        console.log('Invalid role in token:', payload.role);
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
      }
      
      console.log('Govern token validation successful, proceeding to govern body route');
    } catch (error) {
      console.error('Govern token verification failed:', error);
      // Token verification failed, redirect to login
      const url = new URL('/login', request.url);
      const response = NextResponse.redirect(url);
      
      // Clear the invalid token
      response.cookies.delete('govern_token');
      
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
    
    // If already logged in as donor and trying to access login page, redirect to donor dashboard
    const donorToken = request.cookies.get('donor_token')?.value;
    
    if (donorToken) {
      try {
        // Verify token
        const { payload } = await jwtVerify(donorToken, JWT_SECRET);
        
        // Check if token has donor role and redirect to appropriate dashboard
        if (payload.role === 'donor') {
          const url = new URL('/donors', request.url);
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

// Update config to include all routes
export const config = {
  matcher: [
    '/school/:path*',
    '/schools/:path*',
    '/donor/:path*',
    '/donors/:path*',
    '/govern-bodies/:path*',
    '/governBody/:path*',
    '/govern/:path*',
    '/login'
  ],
};