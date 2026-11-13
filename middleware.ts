import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Admin Login page and Login API endpoint
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/auth/login' ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const adminAuthCookie = request.cookies.get('jm_admin_auth');
  const isAuthenticated = adminAuthCookie?.value === 'authenticated';

  // 2. Protect Admin UI Routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Admin API Routes
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

