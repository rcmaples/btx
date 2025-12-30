# Tasks: Supabase to Clerk + Prisma Migration

## Phase 0: Preparation ✅

### P0-1: Provision Prisma Postgres Database
- [x] Log into Prisma Console (console.prisma.io)
- [x] Create new Prisma Postgres database in appropriate region
- [x] Copy connection string (DATABASE_URL)
- [x] Note: Use Prisma Accelerate URL for serverless compatibility

### P0-2: Initialize Prisma in Storefront
- [x] Run `pnpm add -D prisma` in `apps/storefront`
- [x] Run `pnpm add @prisma/client` in `apps/storefront`
- [x] Run `npx prisma init` to create `prisma/` directory
- [x] Configure `prisma/schema.prisma` with Prisma Postgres datasource

### P0-3: Create Prisma Schema
- [x] Define `Profile` model with all fields:
  - id, clerkUserId (unique), email
  - phone (optional)
  - streetAddress, streetAddress2, city, state, postalCode, country
  - isExchangeMember, exchangeEnrolledAt, exchangeCancelledAt
  - createdAt, updatedAt
  - orders relation
- [x] Define `Order` model with all fields:
  - id, orderNumber (unique)
  - profileId (optional), guestEmail (optional)
  - shipping address fields
  - lineItems (Json), pricing fields
  - appliedPromotion (Json), Stripe fields
  - status (enum), isTestOrder
  - createdAt, updatedAt
  - indexes
- [x] Define `OrderStatus` enum

### P0-4: Run Initial Migration
- [x] Add `DATABASE_URL` to `apps/storefront/.env`
- [x] Run `npx prisma migrate dev --name init`
- [x] Verify tables created in Prisma Console
- [x] Run `npx prisma generate` to generate client

### P0-5: Install Clerk SDK
- [x] Run `pnpm add @clerk/nextjs` in `apps/storefront`
- [x] Run `pnpm add svix` in `apps/storefront` (for webhook verification)

### P0-6: Configure Clerk Environment Variables
- [x] Create Clerk application at clerk.com (if not already)
- [ ] Enable Google OAuth in Clerk Dashboard
- [ ] Enable GitHub OAuth in Clerk Dashboard
- [x] Add to `apps/storefront/.env`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profile`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/complete-profile`

### P0-7: Verify Build Still Passes
- [x] Run `pnpm build` in `apps/storefront`
- [x] Confirm app still works with existing Supabase code

---

## Phase 1: Remove Supabase ✅

### P1-1: Remove Supabase Packages
- [x] Remove `@supabase/ssr` from `package.json`
- [x] Remove `@supabase/supabase-js` from `package.json`
- [x] Run `pnpm install` to update lockfile

### P1-2: Delete Supabase Client Files
- [x] Delete `apps/storefront/lib/supabase/client.ts`
- [x] Delete `apps/storefront/lib/supabase/server.ts`
- [x] Delete `apps/storefront/lib/supabase/` directory

### P1-3: Delete Supabase Webhook
- [x] Delete `apps/storefront/app/api/webhooks/supabase/route.ts`
- [x] Delete `apps/storefront/app/api/webhooks/supabase/` directory

### P1-4: Delete Supabase Migrations
- [x] Delete `apps/storefront/supabase/` directory entirely

### P1-5: Remove Supabase Environment Variables
- [x] Remove `NEXT_PUBLIC_SUPABASE_URL` from `.env`
- [x] Remove `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env`
- [x] Remove `SUPABASE_WEBHOOK_SECRET` from `.env`

### P1-6: Remove Auth Provider
- [x] Delete `apps/storefront/lib/providers/AuthProvider.tsx`
- [x] Delete `apps/storefront/lib/providers/ClientAuthWrapper.tsx`
- [x] Delete `apps/storefront/lib/utils/profileCache.ts`
- [x] Update any imports of AuthProvider to remove them

### P1-7: Stub Auth-Dependent Components
- [x] Identify all files importing from deleted modules
- [x] Temporarily stub or comment out auth-dependent code
- [x] Goal: app should build (auth features will be broken)

### P1-8: Verify Clean Slate
- [x] Run `pnpm build` - should pass with stubbed code
- [x] Grep codebase for "supabase" - should find no imports (only comments remain)

---

## Phase 2: Clerk Authentication

### P2-1: Add ClerkProvider to Layout
- [ ] Update `apps/storefront/app/layout.tsx`
- [ ] Wrap children in `<ClerkProvider>`
- [ ] Import from `@clerk/nextjs`

### P2-2: Implement Clerk Middleware
- [ ] Create new `apps/storefront/middleware.ts`
- [ ] Use `clerkMiddleware()` from `@clerk/nextjs/server`
- [ ] Create route matchers for protected routes (`/profile`, `/account`)
- [ ] Add logic to check for profile existence (redirect to `/complete-profile`)
- [ ] Export config with matcher

### P2-3: Create Sign-In Page
- [ ] Update `apps/storefront/app/login/page.tsx`
- [ ] Use Clerk's `<SignIn />` component
- [ ] Configure routing props
- [ ] Style to match existing design

### P2-4: Create Sign-Up Page (Step 1)
- [ ] Update `apps/storefront/app/signup/page.tsx`
- [ ] Use Clerk's `<SignUp />` component
- [ ] Configure to redirect to `/complete-profile` after auth

### P2-5: Create Profile Completion Page
- [ ] Create `apps/storefront/app/complete-profile/page.tsx`
- [ ] Server component that checks for existing profile
- [ ] If profile exists, redirect to `/profile`
- [ ] If no profile, render `ProfileCompletionForm`

### P2-6: Create Profile Completion Form
- [ ] Create `apps/storefront/app/complete-profile/ProfileCompletionForm.tsx`
- [ ] Client component with form fields:
  - Phone (optional)
  - Street Address (required)
  - Street Address 2 (optional)
  - City (required)
  - State (required)
  - Postal Code (required)
  - Country (required, default US)
- [ ] Form validation
- [ ] Submit calls Server Action to create profile
- [ ] On success, redirect to `/profile`

### P2-7: Create Profile Server Action
- [ ] Create `apps/storefront/lib/actions/profile.ts`
- [ ] Implement `createProfile(formData)` action
- [ ] Validate user is authenticated via `auth()`
- [ ] Create profile in Prisma with Clerk user ID
- [ ] Return success/error

### P2-8: Update Header/Navigation
- [ ] Update `apps/storefront/components/Header.tsx`
- [ ] Use Clerk's `<UserButton />` for signed-in users
- [ ] Or implement custom UI with `useUser()` hook
- [ ] Show sign in/sign up links for unauthenticated users

### P2-9: Implement Sign-Out
- [ ] Ensure sign-out works via `<UserButton />` or
- [ ] Implement custom sign-out with `useClerk().signOut()`

### P2-10: Verify Auth Flows
- [ ] Test email/password sign-up → profile form → profile page
- [ ] Test Google OAuth sign-up → complete-profile → profile page
- [ ] Test GitHub OAuth sign-up → complete-profile → profile page
- [ ] Test sign-in (existing user) → profile page
- [ ] Test sign-out → home page
- [ ] Test protected route access when unauthenticated → redirect to login

---

## Phase 3: Prisma Database Integration

### P3-1: Create Prisma Client Singleton
- [ ] Create `apps/storefront/lib/prisma.ts`
- [ ] Implement singleton pattern for Prisma client
- [ ] Handle edge runtime / serverless considerations

### P3-2: Implement Profile Helpers
- [ ] Add `getProfile(clerkUserId)` function
- [ ] Add `hasProfile(clerkUserId)` function (for middleware)
- [ ] Add `getProfileByClerkId(clerkUserId)` with error handling

### P3-3: Update Profile Page
- [ ] Update `apps/storefront/app/profile/page.tsx`
- [ ] Fetch profile from Prisma using `auth()` to get Clerk user ID
- [ ] Pass profile data to client component

### P3-4: Update Profile Client Component
- [ ] Update `apps/storefront/app/profile/ProfileClient.tsx`
- [ ] Replace Supabase hooks with Clerk hooks
- [ ] Display profile data from props/server fetch

### P3-5: Implement Profile Update Action
- [ ] Add `updateProfile(formData)` to `lib/actions/profile.ts`
- [ ] Validate ownership (Clerk user ID matches profile)
- [ ] Update profile in Prisma
- [ ] Revalidate path

### P3-6: Implement Exchange Membership Actions
- [ ] Add `enrollInExchange()` action
- [ ] Add `cancelExchangeMembership()` action
- [ ] Update isExchangeMember, enrolledAt, cancelledAt fields

### P3-7: Update Order Creation
- [ ] Update `apps/storefront/app/checkout/actions.ts`
- [ ] Replace Supabase client with Prisma
- [ ] Create orders in Prisma with profile relation (if authenticated)
- [ ] Support guest checkout (profileId: null, guestEmail: email)

### P3-8: Verify Database Operations
- [ ] Test profile creation during sign-up
- [ ] Test profile update
- [ ] Test Exchange enroll/cancel
- [ ] Test order creation (authenticated)
- [ ] Test order creation (guest)
- [ ] Verify data in Prisma Studio

---

## Phase 4: Profile Data Provider

### P4-1: Choose Data Fetching Strategy
- [ ] Decide: React Context vs React Query vs Server Components only
- [ ] Document decision

### P4-2: Implement Profile Data Provider (if using Context)
- [ ] Create `apps/storefront/lib/providers/ProfileProvider.tsx`
- [ ] Fetch profile on mount (client-side)
- [ ] Provide profile data and loading state
- [ ] Implement refresh function

### P4-3: Or: Implement React Query Setup (if using RQ)
- [ ] Create profile query hook
- [ ] Configure query client
- [ ] Implement optimistic updates for profile changes

### P4-4: Update Dependent Components
- [ ] Update components that need profile data
- [ ] Replace old AuthProvider usage with new pattern
- [ ] Update checkout flow to use profile data

### P4-5: Implement Profile Caching
- [ ] Cache profile data appropriately
- [ ] Invalidate on updates
- [ ] Consider stale-while-revalidate pattern

### P4-6: Verify Profile Data Flow
- [ ] Test profile data available in header
- [ ] Test profile data in checkout
- [ ] Test profile data in membership components

---

## Phase 5: Sanity Webhook Integration

### P5-1: Create Clerk Webhook Endpoint
- [ ] Create `apps/storefront/app/api/webhooks/clerk/route.ts`
- [ ] Import Svix for signature verification
- [ ] Set up POST handler

### P5-2: Implement Webhook Signature Verification
- [ ] Get `CLERK_WEBHOOK_SECRET` from Clerk Dashboard
- [ ] Add to environment variables
- [ ] Verify Svix signature on incoming requests
- [ ] Return 401 if verification fails

### P5-3: Handle user.created Event
- [ ] Parse webhook payload
- [ ] Extract Clerk user data
- [ ] Fetch profile from Prisma (may not exist yet for OAuth)
- [ ] Create customer document in Sanity
- [ ] Map: clerkUserId, email, profile fields (if available)

### P5-4: Handle user.updated Event
- [ ] Parse webhook payload
- [ ] Fetch updated profile from Prisma
- [ ] Update customer document in Sanity
- [ ] Sync all relevant fields

### P5-5: Configure Webhook in Clerk Dashboard
- [ ] Go to Clerk Dashboard → Webhooks
- [ ] Add endpoint: `https://your-domain.com/api/webhooks/clerk`
- [ ] Select events: `user.created`, `user.updated`
- [ ] Copy signing secret to environment

### P5-6: Also Sync on Profile Updates
- [ ] Update profile Server Actions to trigger Sanity sync
- [ ] Or: Create separate `syncProfileToSanity()` helper
- [ ] Call after profile create/update

### P5-7: Test Webhook Delivery
- [ ] Create new user, verify Sanity customer created
- [ ] Update profile, verify Sanity customer updated
- [ ] Check Clerk webhook logs for delivery status

---

## Phase 6: Cleanup & Verification

### P6-1: Remove Remaining Supabase References
- [ ] Global search for "supabase" (case-insensitive)
- [ ] Remove any remaining imports, comments, or references
- [ ] Update any documentation

### P6-2: Update Environment Documentation
- [ ] Create/update `.env.example` with all required variables
- [ ] Document each variable's purpose
- [ ] List required Clerk Dashboard configurations

### P6-3: Full Auth Flow Testing
- [ ] Email/password sign-up (new user)
- [ ] Email/password sign-in (existing user)
- [ ] Google OAuth sign-up (new user)
- [ ] Google OAuth sign-in (existing user)
- [ ] GitHub OAuth sign-up (new user)
- [ ] GitHub OAuth sign-in (existing user)
- [ ] Sign-out from each page type
- [ ] Protected route access (authenticated)
- [ ] Protected route redirect (unauthenticated)
- [ ] Incomplete profile redirect

### P6-4: Profile Flow Testing
- [ ] View profile
- [ ] Update profile fields
- [ ] Enroll in Exchange
- [ ] Cancel Exchange membership
- [ ] Verify Sanity sync after each change

### P6-5: Order Flow Testing
- [ ] Authenticated checkout
- [ ] Guest checkout
- [ ] Verify order in Prisma Studio
- [ ] Verify order linked to profile (authenticated)
- [ ] Verify order has guest email (guest)

### P6-6: Type Check
- [ ] Run `pnpm typecheck` in `apps/storefront`
- [ ] Fix any type errors
- [ ] Ensure no `any` types introduced

### P6-7: Build Verification
- [ ] Run `pnpm build` in `apps/storefront`
- [ ] Fix any build errors
- [ ] Verify no warnings about missing env vars

### P6-8: Vercel Deployment
- [ ] Add all environment variables to Vercel project
- [ ] Deploy to preview
- [ ] Test all flows on preview URL
- [ ] Verify Clerk webhook works with Vercel URL

### P6-9: Production Readiness
- [ ] Update Clerk webhook URL to production domain
- [ ] Verify all environment variables in production
- [ ] Deploy to production
- [ ] Smoke test all critical flows

---

## Post-Migration Follow-ups

### PM-1: FullStory Update (Manual)
- [ ] Update FS.identify() call to use Clerk user ID format
- [ ] User ID changes from UUID to `user_xxx` format
- [ ] Update any custom properties as needed

### PM-2: Documentation Update
- [ ] Update README with new auth setup
- [ ] Document local development setup
- [ ] Document environment variable requirements

### PM-3: Supabase Cleanup
- [ ] Delete Supabase project (optional, after confirming migration success)
- [ ] Or: Pause Supabase project to stop billing
