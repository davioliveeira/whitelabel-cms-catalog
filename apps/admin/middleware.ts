// =============================================================================
// Next.js Middleware - Authentication and Tenant Context
// =============================================================================
// This middleware runs before all routes to:
// 1. Validate authentication using NextAuth.js
// 2. Extract tenant ID from JWT session
// 3. Attach tenant context to request headers for API routes
// 4. Redirect unauthenticated users to login
// =============================================================================

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// =============================================================================
// Public Routes (no authentication required)
// =============================================================================
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/api/auth',
  '/api/auth/callback',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf',
];

// =============================================================================
// Middleware Function
// =============================================================================
export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const tenantId = req.auth?.user?.storeId;

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // ============================================================================
  // AUTHENTICATION CHECK
  // ============================================================================

  // If not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login page
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access auth pages (login/register)
  if (isAuthenticated && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  // ============================================================================
  // TENANT CONTEXT FOR API ROUTES
  // ============================================================================

  // For API routes (except NextAuth routes), attach tenant ID to headers
  if (
    nextUrl.pathname.startsWith('/api/') &&
    !nextUrl.pathname.startsWith('/api/auth/') &&
    !nextUrl.pathname.startsWith('/api/hello')
  ) {
    // If authenticated, attach tenant ID
    if (isAuthenticated && tenantId && req.auth) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-tenant-id', tenantId);
      requestHeaders.set('x-user-role', req.auth.user.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // If not authenticated for API route, return 401
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // ============================================================================
  // DEFAULT: ALLOW REQUEST
  // ============================================================================
  return NextResponse.next();
});

// =============================================================================
// Middleware Configuration
// =============================================================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
