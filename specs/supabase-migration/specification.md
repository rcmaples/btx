# Specification: Supabase to Clerk + Prisma Migration

## Overview

Replace Supabase authentication and database with Clerk (auth) and Prisma Postgres (database) in the BTX storefront application. This is a greenfield implementation with no data migration required.

## Current State (Supabase)

### Authentication
- Email/password sign up and sign in
- Session management via cookies (`@supabase/ssr`)
- Auth state context provider with React hooks
- Route protection via Next.js middleware

### Database Tables
1. **profiles** (linked to `auth.users`)
   - Contact info: email, phone
   - Address: street, street2, city, state, postal_code, country
   - Exchange membership: is_member, enrolled_at, cancelled_at
   - Timestamps: created_at, updated_at

2. **orders**
   - Order details: order_number, status, timestamps
   - User link: user_id (nullable) OR guest_email (nullable)
   - Shipping address fields
   - Line items (JSONB)
   - Pricing: subtotal, discount, shipping_cost, total (in cents)
   - Promotions: applied_promotion (JSONB)
   - Stripe: payment_intent_id, payment_status
   - Flags: is_test_order

### Integrations
- Webhook to Sanity CMS on profile changes
- FullStory user identification (note: requires manual update post-migration)

---

## Target State (Clerk + Prisma)

### Authentication (Clerk)

#### Supported Methods
- Email/password sign up and sign in
- Google OAuth
- GitHub OAuth

#### Session Management
- Clerk's built-in session handling
- `@clerk/nextjs` middleware for route protection
- `auth()` and `currentUser()` helpers for server-side auth
- `useUser()` and `useAuth()` hooks for client-side auth

#### Protected Routes
- `/profile` - requires authentication
- `/account` - requires authentication (future)

#### Public Routes
- `/`, `/products`, `/bundles`, `/exchange`, `/release-notes`
- `/login`, `/signup` (redirect to `/profile` if authenticated)

### Database (Prisma Postgres)

#### Profile Model
```prisma
model Profile {
  id                   String    @id @default(cuid())
  clerkUserId          String    @unique
  email                String
  phone                String?

  // Address
  streetAddress        String?
  streetAddress2       String?
  city                 String?
  state                String?
  postalCode           String?
  country              String    @default("US")

  // Exchange Membership
  isExchangeMember     Boolean   @default(false)
  exchangeEnrolledAt   DateTime?
  exchangeCancelledAt  DateTime?

  // Timestamps
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  orders               Order[]
}
```

#### Order Model
```prisma
model Order {
  id                    String      @id @default(cuid())
  orderNumber           String      @unique

  // User (optional - null for guest checkout)
  profile               Profile?    @relation(fields: [profileId], references: [id])
  profileId             String?

  // Guest checkout
  guestEmail            String?

  // Shipping Address
  shippingFirstName     String
  shippingLastName      String
  shippingStreet        String
  shippingStreet2       String?
  shippingCity          String
  shippingState         String
  shippingPostalCode    String
  shippingCountry       String      @default("US")

  // Order Contents
  lineItems             Json        // Array of cart items

  // Pricing (in cents)
  subtotal              Int
  discount              Int         @default(0)
  shippingCost          Int
  total                 Int

  // Promotions
  appliedPromotion      Json?

  // Stripe
  stripePaymentIntentId String?
  stripePaymentStatus   String?

  // Status
  status                OrderStatus @default(PENDING)
  isTestOrder           Boolean     @default(false)

  // Timestamps
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([profileId])
  @@index([guestEmail])
  @@index([orderNumber])
  @@index([stripePaymentIntentId])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Integrations

#### Clerk Webhook to Sanity
- Endpoint: `/api/webhooks/clerk`
- Triggers: `user.created`, `user.updated`
- Action: Create/update `customer` document in Sanity
- Payload mapping:
  - Clerk `user.id` → Sanity `clerkUserId`
  - Clerk `emailAddresses[0].emailAddress` → Sanity `email`
  - Profile data from Prisma (fetched on webhook) → Sanity address/membership fields

#### FullStory (Manual Follow-up)
- Current: `FS.identify(supabaseUserId, { email, displayName })`
- After migration: Update to use `clerkUserId` instead
- Note: User ID format changes from UUID to Clerk's `user_xxx` format

---

## Functional Requirements

### FR-1: User Registration
- User can sign up with email/password
- User can sign up with Google OAuth
- User can sign up with GitHub OAuth
- **Sign-up requires profile information** (address fields) before completion
- Email/password users complete profile form as step 2 of sign-up
- OAuth users are redirected to `/complete-profile` after authentication
- Users cannot access protected routes until profile is complete
- Profile is created in Prisma upon form submission
- Profile is synced to Sanity CMS

### FR-2: User Sign In
- User can sign in with email/password
- User can sign in with Google OAuth
- User can sign in with GitHub OAuth
- Session persists across page refreshes
- Session expires according to Clerk settings

### FR-3: User Sign Out
- User can sign out from any page
- Session is invalidated
- User is redirected to home page

### FR-4: Route Protection
- Unauthenticated users cannot access `/profile`
- Unauthenticated users are redirected to sign-in
- Authenticated users accessing `/login` or `/signup` are redirected to `/profile`

### FR-5: Profile Management
- User can view their profile information
- User can update: phone, address fields
- User can enroll in Exchange membership
- User can cancel Exchange membership
- Profile updates sync to Sanity CMS

### FR-6: Order Creation
- Authenticated users can place orders linked to their profile
- Guest users can place orders with email only
- Orders are stored in Prisma with all required fields
- Order confirmation displays order number

### FR-7: Guest Checkout
- Users can checkout without creating an account
- Guest orders require email address
- Guest orders have `profileId: null` and `guestEmail: <email>`

---

## Non-Functional Requirements

### NFR-1: Performance
- Auth checks must not block page rendering
- Database queries should use proper indexes
- Prisma connection pooling for serverless environment

### NFR-2: Security
- All auth handled by Clerk (no custom password handling)
- Webhook endpoints validate signatures
- Server Actions validate user ownership before mutations

### NFR-3: Reliability
- Application must build successfully on Vercel
- Type errors must be resolved before deployment
- Failed webhook deliveries should not break user flows

### NFR-4: Developer Experience
- Clear error messages during development
- Prisma Studio available for database inspection
- Environment variables documented
