import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get('gh_tm_auth')

  // Allow access to auth page and static files
  if (pathname === '/auth' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/icons') || pathname.startsWith('/manifest.json')) {
    return NextResponse.next()
  }

  // Protect chi-tieu route
  if (pathname.startsWith('/chi-tieu')) {
    if (!cookie || cookie.value !== '1') {
      // Redirect to auth if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

