import {createServerClient} from '@supabase/ssr'
import {type NextRequest, NextResponse} from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({name, value, options}) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Define route types
  const protectedPaths = ['/profile', '/account']
  const authPaths = ['/login', '/signup']
  const publicPaths = ['/products', '/bundles', '/exchange', '/', '/release-notes']

  const pathname = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))
  const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path) || pathname === path) &&
    !isProtectedPath &&
    !isAuthPath

  // Skip auth check for public routes - significant performance improvement
  if (isPublicPath) {
    return supabaseResponse
  }

  // Only check auth for protected routes and auth pages
  const {
    data: {session},
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // Protect routes that require authentication
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/profile'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/profile/:path*', '/account/:path*', '/login', '/signup'],
}
