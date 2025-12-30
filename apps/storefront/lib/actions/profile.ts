'use server'

import {auth, currentUser} from '@clerk/nextjs/server'
import {revalidatePath} from 'next/cache'

import {prisma} from '@/lib/prisma'
import {upsertCustomer, updateCustomerMembership} from '@/lib/sanity/write-client'

export type ProfileFormData = {
  phone?: string
  streetAddress: string
  streetAddress2?: string
  city: string
  state: string
  postalCode: string
  country?: string
}

export type ProfileActionResult = {
  success: boolean
  error?: string
  profileId?: string
}

/**
 * Helper to sync profile data to Sanity
 * Called after profile mutations to keep Sanity in sync
 */
async function syncProfileToSanity(clerkUserId: string): Promise<void> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {clerkUserId},
    })

    if (!profile) return

    await upsertCustomer({
      clerkUserId,
      email: profile.email,
      phone: profile.phone ?? undefined,
      address: {
        street: profile.streetAddress ?? undefined,
        street2: profile.streetAddress2 ?? undefined,
        city: profile.city ?? undefined,
        state: profile.state ?? undefined,
        postalCode: profile.postalCode ?? undefined,
        country: profile.country,
      },
      exchangeMembership: {
        isMember: profile.isExchangeMember,
        enrolledAt: profile.exchangeEnrolledAt?.toISOString(),
        cancelledAt: profile.exchangeCancelledAt?.toISOString(),
      },
    })
  } catch (error) {
    // Log but don't fail the action if Sanity sync fails
    console.error('Error syncing profile to Sanity:', error)
  }
}

/**
 * Create a new profile for the authenticated user
 */
export async function createProfile(data: ProfileFormData): Promise<ProfileActionResult> {
  const {userId} = await auth()

  if (!userId) {
    return {success: false, error: 'Not authenticated'}
  }

  // Get user's email from Clerk
  const user = await currentUser()
  if (!user?.primaryEmailAddress?.emailAddress) {
    return {success: false, error: 'No email address found'}
  }

  try {
    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: {clerkUserId: userId},
    })

    if (existingProfile) {
      return {success: false, error: 'Profile already exists'}
    }

    // Create the profile
    const profile = await prisma.profile.create({
      data: {
        clerkUserId: userId,
        email: user.primaryEmailAddress.emailAddress,
        phone: data.phone || null,
        streetAddress: data.streetAddress,
        streetAddress2: data.streetAddress2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'US',
      },
    })

    // Sync to Sanity
    await syncProfileToSanity(userId)

    revalidatePath('/profile')

    return {success: true, profileId: profile.id}
  } catch (error) {
    console.error('Error creating profile:', error)
    return {success: false, error: 'Failed to create profile'}
  }
}

/**
 * Update an existing profile for the authenticated user
 */
export async function updateProfile(data: Partial<ProfileFormData>): Promise<ProfileActionResult> {
  const {userId} = await auth()

  if (!userId) {
    return {success: false, error: 'Not authenticated'}
  }

  try {
    const profile = await prisma.profile.update({
      where: {clerkUserId: userId},
      data: {
        phone: data.phone,
        streetAddress: data.streetAddress,
        streetAddress2: data.streetAddress2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      },
    })

    // Sync to Sanity
    await syncProfileToSanity(userId)

    revalidatePath('/profile')

    return {success: true, profileId: profile.id}
  } catch (error) {
    console.error('Error updating profile:', error)
    return {success: false, error: 'Failed to update profile'}
  }
}

/**
 * Get the current user's profile
 */
export async function getCurrentProfile() {
  const {userId} = await auth()

  if (!userId) {
    return null
  }

  return prisma.profile.findUnique({
    where: {clerkUserId: userId},
  })
}

/**
 * Enroll the authenticated user in the Exchange membership program
 */
export async function enrollInExchange(): Promise<ProfileActionResult> {
  const {userId} = await auth()

  if (!userId) {
    return {success: false, error: 'Not authenticated'}
  }

  try {
    const enrolledAt = new Date()
    const profile = await prisma.profile.update({
      where: {clerkUserId: userId},
      data: {
        isExchangeMember: true,
        exchangeEnrolledAt: enrolledAt,
        exchangeCancelledAt: null, // Clear any previous cancellation
      },
    })

    // Sync membership status to Sanity
    await updateCustomerMembership(userId, {
      isMember: true,
      enrolledAt: enrolledAt.toISOString(),
      cancelledAt: null,
    })

    revalidatePath('/profile')

    return {success: true, profileId: profile.id}
  } catch (error) {
    console.error('Error enrolling in Exchange:', error)
    return {success: false, error: 'Failed to enroll in Exchange'}
  }
}

/**
 * Cancel the authenticated user's Exchange membership
 */
export async function cancelExchangeMembership(): Promise<ProfileActionResult> {
  const {userId} = await auth()

  if (!userId) {
    return {success: false, error: 'Not authenticated'}
  }

  try {
    const cancelledAt = new Date()
    const profile = await prisma.profile.update({
      where: {clerkUserId: userId},
      data: {
        isExchangeMember: false,
        exchangeCancelledAt: cancelledAt,
      },
    })

    // Sync membership status to Sanity
    await updateCustomerMembership(userId, {
      isMember: false,
      cancelledAt: cancelledAt.toISOString(),
    })

    revalidatePath('/profile')

    return {success: true, profileId: profile.id}
  } catch (error) {
    console.error('Error cancelling Exchange membership:', error)
    return {success: false, error: 'Failed to cancel Exchange membership'}
  }
}
