import { NextResponse } from 'next/server';

// Middleware to enforce authentication and security
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Security headers for all routes
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');

  // Content Security Policy - strict CSP for production
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  // Protected API routes that require authentication
  const protectedApiRoutes = [
    '/api/token',
    '/api/business-transactions',
    '/api/personal-data',
    '/api/users'
  ];

  // Check if the current route is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (isProtectedApiRoute) {
    // For API routes, we'll let the route handlers handle authentication
    // The middleware just adds security headers
    return response;
  }

  // Protected page routes
  const protectedPageRoutes = [
    '/stepweaver',
    '/personal',
    '/admin'
  ];

  // Check if the current route is a protected page route
  const isProtectedPageRoute = protectedPageRoutes.some(route => pathname.startsWith(route));

  if (isProtectedPageRoute) {
    // For protected pages, we'll let the components handle authentication
    // The middleware just adds security headers
    return response;
  }

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
