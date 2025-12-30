import {auth} from '@clerk/nextjs/server'
import {NextResponse} from 'next/server'

import {getProfile} from '@/lib/prisma'

export type ProfileResponse = {
  id: string
  clerkUserId: string
  email: string
  phone: string | null
  streetAddress: string | null
  streetAddress2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string
  isExchangeMember: boolean
  exchangeEnrolledAt: string | null
  exchangeCancelledAt: string | null
  createdAt: string
  updatedAt: string
} | null

/**
 * GET /api/profile
 * Returns the current user's profile
 * - 401 if not authenticated
 * - 404 if authenticated but no profile exists
 * - 200 with profile data on success
 */
export async function GET() {
  const {userId} = await auth()

  if (!userId) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const profile = await getProfile(userId)

  if (!profile) {
    return NextResponse.json({error: 'Profile not found'}, {status: 404})
  }

  // Serialize dates for JSON response
  const response: ProfileResponse = {
    ...profile,
    exchangeEnrolledAt: profile.exchangeEnrolledAt?.toISOString() ?? null,
    exchangeCancelledAt: profile.exchangeCancelledAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  }

  return NextResponse.json(response)
}
