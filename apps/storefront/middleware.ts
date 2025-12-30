import {type NextRequest, NextResponse} from 'next/server'

// Stub middleware - auth protection temporarily disabled during migration
// Will be replaced with Clerk middleware in Phase 2
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/account/:path*', '/login', '/signup'],
}
