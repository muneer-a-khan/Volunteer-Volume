import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const role = token?.role;
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/sign-in', 
    '/sign-up', 
    '/about', 
    '/faq', 
    '/contact', 
    '/terms', 
    '/privacy',
    '/api/auth'
  ];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!isAuthenticated) {
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Volunteer or admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/shifts') || pathname.startsWith('/log-hours')) {
    if (role !== 'VOLUNTEER' && role !== 'ADMIN' && role !== 'GROUP_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Guest-only routes (if any)
  if (pathname.startsWith('/guest') && role !== 'GUEST' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Pending users can only access specific pages
  if (role === 'PENDING') {
    const allowedPendingRoutes = ['/profile', '/application-success'];
    if (!allowedPendingRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/application-success', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}; 