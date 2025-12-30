import {createClient} from '@sanity/client'

import {apiVersion, dataset, projectId} from './api'

/**
 * Server-side Sanity client with write permissions
 * Only use in server contexts (API routes, Server Actions)
 * Requires SANITY_API_WRITE_TOKEN environment variable with write permissions
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Don't use CDN for writes
  token: process.env.SANITY_API_WRITE_TOKEN,
})

/**
 * Type for customer document in Sanity
 */
export interface SanityCustomer {
  _id: string
  _type: 'customer'
  clerkUserId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: {
    street?: string
    street2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  exchangeMembership?: {
    isMember: boolean
    enrolledAt?: string
    cancelledAt?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Create or update a customer document in Sanity
 * Uses clerkUserId as the document ID to ensure uniqueness
 */
export async function upsertCustomer(
  data: Omit<SanityCustomer, '_id' | '_type' | 'createdAt' | 'updatedAt'>,
): Promise<SanityCustomer> {
  const documentId = `customer-${data.clerkUserId}`
  const now = new Date().toISOString()

  // Check if customer exists
  const existing = await writeClient.fetch<SanityCustomer | null>(
    `*[_type == "customer" && _id == $id][0]`,
    {id: documentId},
  )

  if (existing) {
    // Update existing customer
    return writeClient
      .patch(documentId)
      .set({
        ...data,
        updatedAt: now,
      })
      .commit() as Promise<SanityCustomer>
  }

  // Create new customer
  return writeClient.create({
    _id: documentId,
    _type: 'customer',
    ...data,
    createdAt: now,
    updatedAt: now,
  }) as Promise<SanityCustomer>
}

/**
 * Get customer by Clerk user ID
 */
export async function getCustomerByClerkId(clerkUserId: string): Promise<SanityCustomer | null> {
  return writeClient.fetch<SanityCustomer | null>(
    `*[_type == "customer" && clerkUserId == $clerkUserId][0]`,
    {clerkUserId},
  )
}

/**
 * Update customer profile data (phone, address, membership)
 * Used when profile is updated - doesn't modify name fields
 */
export async function updateCustomerProfile(
  clerkUserId: string,
  data: {
    phone?: string
    address?: {
      street?: string
      street2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
    exchangeMembership?: {
      isMember: boolean
      enrolledAt?: string
      cancelledAt?: string
    }
  },
): Promise<SanityCustomer | null> {
  const documentId = `customer-${clerkUserId}`
  const now = new Date().toISOString()

  try {
    return (await writeClient
      .patch(documentId)
      .set({
        ...data,
        updatedAt: now,
      })
      .commit()) as SanityCustomer
  } catch {
    // Customer doesn't exist yet
    return null
  }
}

/**
 * Update customer exchange membership status
 */
export async function updateCustomerMembership(
  clerkUserId: string,
  membership: {
    isMember: boolean
    enrolledAt?: string | null
    cancelledAt?: string | null
  },
): Promise<SanityCustomer | null> {
  const documentId = `customer-${clerkUserId}`
  const now = new Date().toISOString()

  try {
    return (await writeClient
      .patch(documentId)
      .set({
        exchangeMembership: {
          isMember: membership.isMember,
          ...(membership.enrolledAt && {enrolledAt: membership.enrolledAt}),
          ...(membership.cancelledAt && {cancelledAt: membership.cancelledAt}),
        },
        updatedAt: now,
      })
      .commit()) as SanityCustomer
  } catch {
    // Customer doesn't exist yet
    return null
  }
}
