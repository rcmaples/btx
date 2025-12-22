import {createClient} from '@sanity/client'
import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'btx',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

interface ProfileRecord {
  id: string
  email: string
  phone: string | null
  street_address: string | null
  street_address_2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  created_at: string
  updated_at: string
  // Exchange membership fields
  is_exchange_member: boolean
  exchange_enrolled_at: string | null
  exchange_cancelled_at: string | null
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: ProfileRecord
  old_record?: ProfileRecord
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const webhookSecret = request.headers.get('x-webhook-secret')
  if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    console.error('Invalid webhook secret')
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  try {
    const payload: WebhookPayload = await request.json()

    // Only handle profiles table events
    if (payload.table !== 'profiles') {
      return NextResponse.json({message: 'Ignored - not profiles table'})
    }

    const {record, type} = payload

    if (type === 'DELETE') {
      // Leave customer records in Sanity for order history
      return NextResponse.json({message: 'Delete ignored - preserving customer record'})
    }

    // Upsert customer document in Sanity
    // Use supabaseId as the document ID for idempotency
    const sanityDocId = `customer-${record.id}`

    const customerDoc = {
      _id: sanityDocId,
      _type: 'customer',
      supabaseId: record.id,
      email: record.email,
      phone: record.phone || undefined,
      address: {
        street: record.street_address || undefined,
        street2: record.street_address_2 || undefined,
        city: record.city || undefined,
        state: record.state || undefined,
        postalCode: record.postal_code || undefined,
        country: record.country || 'US',
      },
      exchangeMembership: {
        isMember: record.is_exchange_member || false,
        enrolledAt: record.exchange_enrolled_at || undefined,
        cancelledAt: record.exchange_cancelled_at || undefined,
      },
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }

    // Remove undefined values from nested objects
    const cleanDoc = JSON.parse(JSON.stringify(customerDoc))

    await sanityClient.createOrReplace(cleanDoc)

    console.log(`Synced customer ${record.email} to Sanity (${type})`)

    return NextResponse.json({
      success: true,
      message: `Customer ${type.toLowerCase()}d successfully`,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({error: 'Failed to process webhook'}, {status: 500})
  }
}
