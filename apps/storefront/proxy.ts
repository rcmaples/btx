import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server'
import {NextResponse} from 'next/server'

// Routes that require authentication
const isProtectedRoute = createRouteMatcher(['/profile(.*)', '/account(.*)', '/complete-profile'])

export const proxy = clerkMiddleware(async (auth, request) => {
  const {userId} = await auth()

  // If route is protected and user isn't authenticated, redirect to login
  if (isProtectedRoute(request) && !userId) {
    const signInUrl = new URL('/login', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Note: Profile existence check is done at the page level since Edge proxy
  // cannot access Prisma directly. See /profile and /account pages.

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
