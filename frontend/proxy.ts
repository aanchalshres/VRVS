import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin routes
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // NGO routes
    if (pathname.startsWith('/dashboard/ngo') && role !== 'ngo') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Volunteer routes
    if (pathname.startsWith('/dashboard/volunteer') && role !== 'volunteer') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/dashboard/:path*'],
};
