import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware to add security headers and handle other global middleware tasks
 * This runs on every request before it reaches the page or API route
 */
export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    // Prevents browser from MIME-sniffing a response away from the declared content-type
    'X-Content-Type-Options': 'nosniff',

    // Prevents page from being framed by other sites (clickjacking protection)
    'X-Frame-Options': 'DENY',

    // Prevents browser from loading when it detects reflected XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Controls how much information is included in referrer header
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Controls which features and APIs can be used in the browser
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

    // Controls which resources the browser is allowed to load
    'Content-Security-Policy': getContentSecurityPolicy(),
  };

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  // Add HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Define which routes the middleware should run on
 */
export const config = {
  matcher: [
    // Match all routes except static files, api/health, and _next
    '/((?!_next/static|_next/image|favicon.ico|public/|api/health).*)',
  ],
};

/**
 * Generate Content Security Policy header
 */
function getContentSecurityPolicy() {
  const policy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Consider removing unsafe-inline/eval in production
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https://*', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://*', 'wss://*'],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  // Convert the policy object to a string
  return Object.entries(policy)
    .map(([key, values]) => {
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
} 