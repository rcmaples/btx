'use server'

import {auth, currentUser} from '@clerk/nextjs/server'
import {revalidatePath} from 'next/cache'

import {prisma} from '@/lib/prisma'

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
