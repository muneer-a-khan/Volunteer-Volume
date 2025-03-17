import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define routes that are protected (require authentication)
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/log-hours',
  '/check-in',
  '/admin',
  '/shifts',
];

// Define routes that are admin-only
const adminRoutes = [
  '/admin',
];

// Define routes that are public (no authentication required)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/apply',
  '/about',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Bypass middleware for public routes and static files
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.includes('/_next/') ||
    pathname.includes('/static/') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg')
  ) {
    return NextResponse.next();
  }

  // Check if we're on a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if we're on an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get user's session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if trying to access protected page without being authenticated
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if trying to access admin page without admin role
  if (isAdminRoute && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (inside public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}; 