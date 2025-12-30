import type {WebhookEvent} from '@clerk/nextjs/server'
import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {Webhook} from 'svix'

import {closeCustomerAccount} from '@/lib/sanity/write-client'

/**
 * Clerk Webhook Handler
 *
 * Handles user.deleted events to mark customer accounts as closed in Sanity.
 * Webhook signature is verified using Svix.
 *
 * Note: user.created/updated are NOT handled here. Customer records in Sanity
 * are created when the user completes their profile (via createProfile action).
 * This avoids race conditions between webhook and profile completion.
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

  if (eventType === 'user.deleted') {
    const {id: clerkUserId} = evt.data

    if (!clerkUserId) {
      console.error('No user ID in user.deleted event')
      return NextResponse.json({error: 'No user ID found'}, {status: 400})
    }

    try {
      // Mark customer as closed in Sanity (soft delete)
      await closeCustomerAccount(clerkUserId)
      console.log(`Marked customer ${clerkUserId} as closed in Sanity`)
      return NextResponse.json({success: true})
    } catch (error) {
      console.error('Error closing customer account in Sanity:', error)
      return NextResponse.json({error: 'Failed to close customer account'}, {status: 500})
    }
  }

  // Acknowledge other event types (user.created, user.updated are handled via profile creation)
  return NextResponse.json({success: true, message: 'Event type not handled'})
}
