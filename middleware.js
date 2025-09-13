import { NextResponse } from 'next/server';
// Note: Removed Firebase middleware as it's client-side auth; use client guards instead
// For server-side protection, consider API routes with Firebase Admin SDK verification

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip for auth routes and static assets
  if (pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Redirect unauthenticated to login (client-side handles actual auth check)
  const url = request.nextUrl.clone();
  url.pathname = 'components/auth/login';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!auth|_next|favicon.ico).*)'],
};