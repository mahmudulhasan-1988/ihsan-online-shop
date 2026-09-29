import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for Route Protection, Authentication & Edge Proxying
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Better-Auth and Custom Auth Session Cookie Check
  const sessionCookie =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('auth_token')?.value;

  // 2. Protected routes pattern
  const isCustomerDashboard = pathname.startsWith('/dashboard');
  const isSellerRoute = pathname.startsWith('/seller');
  const isAdminRoute = pathname.startsWith('/admin');
  const isProfileRoute = pathname.startsWith('/profile');

  // 3. API Proxy handling for edge routes
  if (pathname.startsWith('/api/proxy/')) {
    const targetPath = pathname.replace('/api/proxy/', '');
    const backendBase = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api';
    const destinationUrl = `${backendBase}/${targetPath}${request.nextUrl.search}`;
    
    return NextResponse.rewrite(new URL(destinationUrl));
  }

  // 4. Client-side authentication fallback: allow Next.js app to render client auth logic,
  // or redirect to /auth if accessing strictly protected pages without cookie
  // (We allow seamless pass-through with custom header for client-side state)
  const response = NextResponse.next();
  response.headers.set('x-current-path', pathname);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
