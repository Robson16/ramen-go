import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

  // Decode the payload without Node-only APIs so this remains Edge-compatible.
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

  // Unauthenticated users cannot access the app or protected routes.
  if (!token && (isProtectedRoute || isAdminRoute || isHomeRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    const payload = getJwtPayload(token)
    const userRole = payload?.role?.toLowerCase() // 'user' or 'admin'

    // Authenticated users should not return to public auth pages.
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Only administrators can access admin routes.
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Exclude static files and images from middleware processing.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
