// =============================================================================
// Next.js Middleware
// =============================================================================
// Extracts tenant slug from URL and sets headers for downstream use.
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract slug (first path segment after /)
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[0];

  if (slug) {
    // Add slug to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', slug);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Root path - allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
