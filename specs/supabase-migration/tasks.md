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

## Phase 2: Clerk Authentication ✅

### P2-1: Add ClerkProvider to Layout
- [x] Update `apps/storefront/app/layout.tsx`
- [x] Wrap children in `<ClerkProvider>`
- [x] Import from `@clerk/nextjs`

### P2-2: Implement Clerk Middleware
- [x] Create new `apps/storefront/proxy.ts` (migrated from middleware.ts for Next.js 16)
- [x] Use `clerkMiddleware()` from `@clerk/nextjs/server`
- [x] Create route matchers for protected routes (`/profile`, `/account`)
- [x] Profile existence check moved to page level (Edge runtime limitation)
- [x] Export config with matcher

### P2-3: Create Sign-In Page
- [x] Update `apps/storefront/app/login/page.tsx`
- [x] Use Clerk's `<SignIn />` component
- [x] Configure routing props
- [x] Style to match existing design

### P2-4: Create Sign-Up Page (Step 1)
- [x] Update `apps/storefront/app/signup/page.tsx`
- [x] Use Clerk's `<SignUp />` component
- [x] Configure to redirect to `/complete-profile` after auth

### P2-5: Create Profile Completion Page
- [x] Create `apps/storefront/app/complete-profile/page.tsx`
- [x] Server component that checks for existing profile
- [x] If profile exists, redirect to `/profile`
- [x] If no profile, render `ProfileCompletionForm`

### P2-6: Create Profile Completion Form
- [x] Create `apps/storefront/app/complete-profile/ProfileCompletionForm.tsx`
- [x] Client component with form fields:
  - Phone (optional)
  - Street Address (required)
  - Street Address 2 (optional)
  - City (required)
  - State (required)
  - Postal Code (required)
  - Country (required, default US)
- [x] Form validation
- [x] Submit calls Server Action to create profile
- [x] On success, redirect to `/profile`

### P2-7: Create Profile Server Action
- [x] Create `apps/storefront/lib/actions/profile.ts`
- [x] Implement `createProfile(formData)` action
- [x] Validate user is authenticated via `auth()`
- [x] Create profile in Prisma with Clerk user ID
- [x] Return success/error

### P2-8: Update Header/Navigation
- [x] Update `apps/storefront/components/common/Navigation.tsx`
- [x] Use Clerk's `useUser()` hook
- [x] Show sign in/sign up links for unauthenticated users
- [x] Show Profile link + Sign Out for authenticated users

### P2-9: Implement Sign-Out
- [x] Implement sign-out with Clerk's `<SignOutButton />`

### P2-10: Verify Auth Flows
- [ ] Test email/password sign-up → profile form → profile page
- [ ] Test Google OAuth sign-up → complete-profile → profile page
- [ ] Test GitHub OAuth sign-up → complete-profile → profile page
- [ ] Test sign-in (existing user) → profile page
- [ ] Test sign-out → home page
- [ ] Test protected route access when unauthenticated → redirect to login

---

## Phase 3: Prisma Database Integration ✅

### P3-1: Create Prisma Client Singleton
- [x] Create `apps/storefront/lib/prisma.ts`
- [x] Implement singleton pattern for Prisma client
- [x] Handle serverless considerations with Prisma Accelerate

### P3-2: Implement Profile Helpers
- [x] Add `getProfile(clerkUserId)` function
- [x] Add `hasProfile(clerkUserId)` function
- [x] Add `getProfileOrThrow(clerkUserId)` with error handling

### P3-3: Update Profile Page
- [x] Update `apps/storefront/app/profile/page.tsx`
- [x] Fetch profile from Prisma using `auth()` to get Clerk user ID
- [x] Display profile data directly in server component

### P3-4: Update Profile Client Component
- [x] Created `ExchangeMembershipSection.tsx` client component
- [x] Added enroll/cancel Exchange membership buttons
- [x] Created profile edit page at `/profile/edit`

### P3-5: Implement Profile Update Action
- [x] Add `updateProfile(formData)` to `lib/actions/profile.ts`
- [x] Validate ownership (Clerk user ID matches profile)
- [x] Update profile in Prisma
- [x] Revalidate path

### P3-6: Implement Exchange Membership Actions
- [x] Add `enrollInExchange()` action
- [x] Add `cancelExchangeMembership()` action
- [x] Update isExchangeMember, enrolledAt, cancelledAt fields

### P3-7: Update Order Creation
- [x] Update `apps/storefront/app/checkout/actions.ts`
- [x] Replace stubbed code with Prisma
- [x] Create orders in Prisma with profile relation (if authenticated)
- [x] Support guest checkout (profileId: null, guestEmail: email)
- [x] Add first/last name fields to shipping address

### P3-8: Verify Database Operations
- [ ] Test profile creation during sign-up
- [ ] Test profile update
- [ ] Test Exchange enroll/cancel
- [ ] Test order creation (authenticated)
- [ ] Test order creation (guest)
- [ ] Verify data in Prisma Studio

---

## Phase 4: Profile Data Provider ✅

### P4-1: Choose Data Fetching Strategy
- [x] Decided: TanStack Query (React Query) - already in use in the app
- [x] Created API route + client hook approach

### P4-2: Implement API Route
- [x] Create `/api/profile/route.ts` for client-side profile fetching
- [x] Returns serialized profile data with dates as ISO strings
- [x] Returns null for unauthenticated users or missing profiles

### P4-3: Implement React Query Setup
- [x] Create `useProfile` hook with TanStack Query
- [x] 2-minute stale time, 5-minute cache time
- [x] `invalidateProfile()` function for cache invalidation

### P4-4: Update Dependent Components
- [x] Rewrote `useMembership` hook to use Clerk + Prisma
- [x] Updated `MembershipClient` with proper auth redirects
- [x] Updated `ExchangeClient` with proper auth state

### P4-5: Implement Profile Caching
- [x] TanStack Query handles caching automatically
- [x] Invalidate on enroll/cancel membership
- [x] Stale-while-revalidate pattern via query config

### P4-6: Verify Profile Data Flow
- [x] Build passes with all changes
- [ ] Manual testing of profile data in membership components

---

## Phase 5: Sanity Webhook Integration ✅

### P5-1: Create Clerk Webhook Endpoint
- [x] Create `apps/storefront/app/api/webhooks/clerk/route.ts`
- [x] Import Svix for signature verification
- [x] Set up POST handler

### P5-2: Implement Webhook Signature Verification
- [x] Verify Svix signature on incoming requests
- [x] Return 401 if verification fails
- [ ] Add `CLERK_WEBHOOK_SECRET` to environment variables (manual step)

### P5-3: Handle user.created Event
- [x] Parse webhook payload
- [x] Extract Clerk user data
- [x] Fetch profile from Prisma (may not exist yet for OAuth)
- [x] Create customer document in Sanity
- [x] Map: clerkUserId, email, profile fields (if available)

### P5-4: Handle user.updated Event
- [x] Parse webhook payload
- [x] Fetch updated profile from Prisma
- [x] Update customer document in Sanity
- [x] Sync all relevant fields

### P5-5: Configure Webhook in Clerk Dashboard
- [ ] Go to Clerk Dashboard → Webhooks
- [ ] Add endpoint: `https://your-domain.com/api/webhooks/clerk`
- [ ] Select events: `user.created`, `user.updated`
- [ ] Copy signing secret to environment

### P5-6: Also Sync on Profile Updates
- [x] Created `syncProfileToSanity()` helper in profile actions
- [x] Created Sanity write client with `upsertCustomer` and `updateCustomerMembership`
- [x] Call after profile create/update and membership changes

### P5-7: Update Sanity Customer Schema
- [x] Changed `supabaseId` to `clerkUserId` in customer schema

### P5-8: Test Webhook Delivery
- [ ] Create new user, verify Sanity customer created
- [ ] Update profile, verify Sanity customer updated
- [ ] Check Clerk webhook logs for delivery status

---

## Phase 6: Cleanup & Verification ✅

### P6-1: Remove Remaining Supabase References
- [x] Global search for "supabase" (case-insensitive)
- [x] Removed Supabase MCP server from `.mcp.json`
- [x] Updated `turbo.json` - replaced Supabase env vars with Clerk
- [x] Updated `packages/eslint-config/base.js` - replaced Supabase env vars with Clerk
- [x] Deleted unused stub components (`ProfileClient.tsx`, `MigrationPromptWrapper.tsx`)
- [x] Note: Migration docs and Sanity generated types will update when schema is deployed

### P6-2: Update Environment Documentation
- [x] Created `.env.example` with all required variables
- [x] Documented each variable's purpose
- [x] Listed required Clerk Dashboard configurations

### P6-3: Full Auth Flow Testing (Manual)
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

### P6-4: Profile Flow Testing (Manual)
- [ ] View profile
- [ ] Update profile fields
- [ ] Enroll in Exchange
- [ ] Cancel Exchange membership
- [ ] Verify Sanity sync after each change

### P6-5: Order Flow Testing (Manual)
- [ ] Authenticated checkout
- [ ] Guest checkout
- [ ] Verify order in Prisma Studio
- [ ] Verify order linked to profile (authenticated)
- [ ] Verify order has guest email (guest)

### P6-6: Type Check
- [x] Run `pnpm typecheck` in `apps/storefront` - passes
- [x] No type errors
- [x] No `any` types introduced

### P6-7: Build Verification
- [x] Run `pnpm build` in `apps/storefront` - passes
- [x] No build errors

### P6-8: Vercel Deployment (Manual)
- [ ] Add all environment variables to Vercel project
- [ ] Deploy to preview
- [ ] Test all flows on preview URL
- [ ] Verify Clerk webhook works with Vercel URL

### P6-9: Production Readiness (Manual)
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
