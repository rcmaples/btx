import type {WebhookEvent} from '@clerk/nextjs/server'
import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {Webhook} from 'svix'

import {getProfile} from '@/lib/prisma'
import {upsertCustomer} from '@/lib/sanity/write-client'

/**
 * Clerk Webhook Handler
 *
 * Handles user.created and user.updated events to sync customer data to Sanity.
 * Webhook signature is verified using Svix.
 *
 * Required environment variables:
 * - CLERK_WEBHOOK_SECRET: Signing secret from Clerk Dashboard (production)
 * - CLERK_LOCAL_WEBHOOK_SECRET: Signing secret for local development (optional)
 */
export async function POST(req: Request) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const WEBHOOK_SECRET = isDevelopment
    ? process.env.CLERK_LOCAL_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SECRET
    : process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error(
      isDevelopment
        ? 'CLERK_LOCAL_WEBHOOK_SECRET or CLERK_WEBHOOK_SECRET is not set'
        : 'CLERK_WEBHOOK_SECRET is not set',
    )
    return NextResponse.json({error: 'Server configuration error'}, {status: 500})
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({error: 'Missing svix headers'}, {status: 400})
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json({error: 'Invalid signature'}, {status: 401})
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const {
      id: clerkUserId,
      email_addresses,
      primary_email_address_id,
      first_name,
      last_name,
    } = evt.data

    // Get primary email
    const primaryEmail = email_addresses?.find((e) => e.id === primary_email_address_id)
    const email = primaryEmail?.email_address

    if (!email) {
      console.error('No email found for user:', clerkUserId)
      return NextResponse.json({error: 'No email found'}, {status: 400})
    }

    // Use email prefix as fallback if name is missing (e.g., OAuth without name)
    const emailPrefix = email.split('@')[0]
    const firstName = first_name || emailPrefix
    const lastName = last_name || ''

    if (!first_name || !last_name) {
      console.warn(`Missing name for user ${clerkUserId}, using email prefix as fallback`)
    }

    // Try to get profile from Prisma (may not exist yet for new users)
    const profile = await getProfile(clerkUserId)

    try {
      // Sync to Sanity
      await upsertCustomer({
        clerkUserId,
        firstName,
        lastName,
        email,
        phone: profile?.phone ?? undefined,
        address: profile
          ? {
              street: profile.streetAddress ?? undefined,
              street2: profile.streetAddress2 ?? undefined,
              city: profile.city ?? undefined,
              state: profile.state ?? undefined,
              postalCode: profile.postalCode ?? undefined,
              country: profile.country,
            }
          : undefined,
        exchangeMembership: profile
          ? {
              isMember: profile.isExchangeMember,
              enrolledAt: profile.exchangeEnrolledAt?.toISOString(),
              cancelledAt: profile.exchangeCancelledAt?.toISOString(),
            }
          : {
              isMember: false,
            },
      })

      console.log(`Synced customer ${clerkUserId} to Sanity`)
      return NextResponse.json({success: true})
    } catch (error) {
      console.error('Error syncing to Sanity:', error)
      return NextResponse.json({error: 'Failed to sync to Sanity'}, {status: 500})
    }
  }

  // Acknowledge other event types
  return NextResponse.json({success: true, message: 'Event type not handled'})
}
