import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Route mappings
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]
const protectedRoutes = ['/orders', '/profile', '/success']
const adminRoutes = ['/admin']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('@ramenGo:accessToken')?.value

  // Helper function to extract JWT payload natively (Edge friendly)
  function getJwtPayload(token: string) {
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isHomeRoute = pathname === '/'

  // 1. Unauthenticated user trying to access a protected or admin route -> Redirect to Login
  if (!token && (isProtectedRoute || isAdminRoute || isHomeRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Authenticated user
  if (token) {
    const payload = getJwtPayload(token)
    const userRole = payload?.role?.toLowerCase() // 'user' or 'admin'

    // 2.1. Trying to access login/register while already logged in -> Redirect to Home
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2.2. Trying to access Admin route without being an Admin -> Redirect to Home (or error page)
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Configuration to prevent the middleware from running on static files and images
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
