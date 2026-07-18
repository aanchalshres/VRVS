import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const authPages = ['/login', '/login/volunteer', '/login/ngo', '/signup', '/signup/volunteer-register', '/signup/ngo-register'];

  // Logged-in users shouldn't see login/signup pages
  if (token && authPages.includes(pathname)) {
    if (role === 'volunteer') {
      return NextResponse.redirect(new URL('/dashboard/volunteer', request.url));
    }
    if (role === 'ngo') {
      return NextResponse.redirect(new URL('/dashboard/ngo', request.url));
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin routes
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return role
        ? NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
        : NextResponse.redirect(new URL('/login', request.url));
    }

    // NGO routes
    if (pathname.startsWith('/dashboard/ngo') && role !== 'ngo') {
      return role
        ? NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
        : NextResponse.redirect(new URL('/login', request.url));
    }

    // Volunteer routes
    if (pathname.startsWith('/dashboard/volunteer') && role !== 'volunteer') {
      return role
        ? NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
        : NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/login/:path*', '/signup', '/signup/:path*'],
};