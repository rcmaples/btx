# Plan: Supabase to Clerk + Prisma Migration

## Technology Stack

| Layer | Current | Target |
|-------|---------|--------|
| Authentication | Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`) | Clerk (`@clerk/nextjs`) |
| Database | Supabase Postgres | Prisma Postgres (hosted) |
| ORM | Supabase Client | Prisma Client (`@prisma/client`) |
| Session Storage | Cookies (Supabase managed) | Cookies (Clerk managed) |
| Middleware | Custom Supabase middleware | Clerk `clerkMiddleware()` |

## Architecture Decisions

### AD-1: Clerk Integration Pattern
- Use `@clerk/nextjs` App Router integration
- Wrap app in `<ClerkProvider>` at root layout
- Use `clerkMiddleware()` for route protection
- Server Components: use `auth()` and `currentUser()`
- Client Components: use `useUser()`, `useAuth()`, `useClerk()`
- Custom sign-in/sign-up pages (not Clerk's hosted pages) to match existing UI

### AD-2: Prisma Setup
- Initialize Prisma in `apps/storefront/prisma/`
- Use Prisma Postgres (managed hosting via Prisma Console)
- Connection string via `DATABASE_URL` environment variable
- Use Prisma Accelerate for connection pooling in serverless

### AD-3: Profile Creation Strategy (Sign-Up Flow)
- **Profiles are created during sign-up, not lazily**
- Use Clerk's multi-step sign-up flow:
  1. Step 1: Clerk handles email/password or OAuth authentication
  2. Step 2: Custom form collects required profile fields (phone, address)
  3. Step 3: Profile created in Prisma, then sign-up completed
- For OAuth sign-ups, redirect to profile completion page before granting full access
- Middleware checks for profile existence; incomplete profiles redirected to `/complete-profile`

### AD-4: Auth Context Replacement
- Remove custom `AuthProvider` entirely
- Replace `useAuth()` custom hook with Clerk's `useUser()` / `useAuth()`
- Profile data fetched separately via React Query or Server Components

### AD-5: Middleware Strategy
- Use Clerk's `clerkMiddleware()` with `createRouteMatcher()`
- Protected routes: `/profile(.*)`, `/account(.*)`
- Public routes: everything else (Clerk allows by default)
- Additional check: authenticated users without profile → redirect to `/complete-profile`
- Remove all custom Supabase middleware logic

---

## Implementation Phases

### Phase 0: Preparation
**Goal**: Set up infrastructure without breaking existing functionality

1. Provision Prisma Postgres database
2. Initialize Prisma in storefront app
3. Create Prisma schema (Profile, Order models)
4. Run initial migration
5. Set up environment variables (local + Vercel)
6. Install Clerk SDK
7. Configure Clerk environment variables

**Checkpoint**: `pnpm build` passes, app still works with Supabase

---

### Phase 1: Remove Supabase (Clean Slate)
**Goal**: Remove all Supabase code to create a clean foundation

1. Remove Supabase packages from `package.json`
2. Delete Supabase client files (`lib/supabase/`)
3. Delete Supabase webhook route (`app/api/webhooks/supabase/`)
4. Delete Supabase migrations folder (`supabase/`)
5. Remove Supabase environment variables from `.env`
6. Remove `AuthProvider` and `ClientAuthWrapper`
7. Stub out auth-dependent components to prevent crashes

**Checkpoint**: App builds but auth features are broken (expected)

---

### Phase 2: Clerk Authentication
**Goal**: Implement authentication with Clerk

1. Add `<ClerkProvider>` to root layout
2. Implement `clerkMiddleware()` with route matchers
3. Create sign-in page using Clerk's `<SignIn />` component
4. Create multi-step sign-up flow:
   - Page 1: `<SignUp />` component for auth credentials
   - Page 2: Custom profile form (phone, address fields)
   - Server Action to create Prisma profile on form submission
5. Create `/complete-profile` page for OAuth users who need to add profile info
6. Update middleware to check profile existence for authenticated users
7. Update header/navigation to use Clerk's `<UserButton />` or custom UI
8. Implement sign-out functionality

**Checkpoint**: Users can sign up (with profile info), sign in, sign out; protected routes work

---

### Phase 3: Prisma Database Integration
**Goal**: Connect application to Prisma database

1. Create Prisma client singleton (`lib/prisma.ts`)
2. Implement `getProfile()` helper function (fetch by Clerk user ID)
3. Implement `hasProfile()` helper for middleware checks
4. Create profile creation Server Action (used during sign-up)
5. Update profile page to fetch from Prisma
6. Implement profile update Server Action
7. Implement Exchange membership enroll/cancel Server Actions
8. Update order creation Server Action to use Prisma

**Checkpoint**: Profile CRUD works, orders can be created

---

### Phase 4: Profile Data Provider
**Goal**: Provide profile data to components that need it

1. Create `ProfileProvider` context (simpler than old AuthProvider)
2. Or: Use React Query for profile data fetching
3. Update components to consume profile data
4. Implement profile caching strategy
5. Update checkout flow to use new profile data

**Checkpoint**: All profile-dependent features work

---

### Phase 5: Sanity Webhook Integration
**Goal**: Sync profile changes to Sanity CMS

1. Create Clerk webhook endpoint (`app/api/webhooks/clerk/route.ts`)
2. Implement Svix signature verification
3. Handle `user.created` event (create Sanity customer)
4. Handle `user.updated` event (update Sanity customer)
5. Fetch profile data from Prisma to include in Sanity sync
6. Configure webhook in Clerk Dashboard
7. Test webhook delivery

**Checkpoint**: Profile changes appear in Sanity CMS

---

### Phase 6: Cleanup & Verification
**Goal**: Final polish and verification

1. Remove any remaining Supabase references
2. Update all environment variable documentation
3. Verify all auth flows work end-to-end
4. Verify order creation (authenticated + guest)
5. Verify Exchange membership flows
6. Run full type check (`pnpm typecheck`)
7. Run build (`pnpm build`)
8. Test on Vercel preview deployment

**Checkpoint**: Production-ready

---

## Sign-Up Flow Detail

### Email/Password Sign-Up
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Sign Up Page   │────▶│ Profile Form     │────▶│  /profile   │
│  (Clerk SignUp) │     │ (Custom)         │     │  (Success)  │
│                 │     │                  │     │             │
│ - Email         │     │ - Phone          │     │             │
│ - Password      │     │ - Street Address │     │             │
│ - Verify email  │     │ - City/State/Zip │     │             │
└─────────────────┘     └──────────────────┘     └─────────────┘
                              │
                              ▼
                        Create Profile
                        in Prisma
```

### OAuth Sign-Up (Google/GitHub)
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Sign Up Page   │────▶│ /complete-profile│────▶│  /profile   │
│  (Clerk SignUp) │     │ (Required)       │     │  (Success)  │
│                 │     │                  │     │             │
│ - Google btn    │     │ - Phone          │     │             │
│ - GitHub btn    │     │ - Street Address │     │             │
│                 │     │ - City/State/Zip │     │             │
└─────────────────┘     └──────────────────┘     └─────────────┘
                              │
         Middleware checks    │
         for profile,         ▼
         redirects if    Create Profile
         missing         in Prisma
```

### Required Profile Fields at Sign-Up
| Field | Required | Notes |
|-------|----------|-------|
| Phone | Optional | Can add later |
| Street Address | Required | For shipping |
| Street Address 2 | Optional | Apt/Suite |
| City | Required | |
| State | Required | |
| Postal Code | Required | |
| Country | Required | Default: "US" |

---

## File Changes Summary

### Files to Delete
```
apps/storefront/lib/supabase/client.ts
apps/storefront/lib/supabase/server.ts
apps/storefront/lib/providers/AuthProvider.tsx
apps/storefront/lib/providers/ClientAuthWrapper.tsx
apps/storefront/lib/utils/profileCache.ts
apps/storefront/app/api/webhooks/supabase/route.ts
apps/storefront/supabase/ (entire directory)
apps/storefront/middleware.ts (replace, not delete)
```

### Files to Create
```
apps/storefront/prisma/schema.prisma
apps/storefront/lib/prisma.ts
apps/storefront/lib/actions/profile.ts
apps/storefront/app/complete-profile/page.tsx
apps/storefront/app/complete-profile/ProfileCompletionForm.tsx
apps/storefront/app/api/webhooks/clerk/route.ts
apps/storefront/middleware.ts (new implementation)
```

### Files to Modify
```
apps/storefront/package.json (dependencies)
apps/storefront/app/layout.tsx (ClerkProvider)
apps/storefront/app/login/page.tsx (Clerk SignIn)
apps/storefront/app/signup/page.tsx (Clerk SignUp + profile step)
apps/storefront/app/profile/page.tsx (Prisma queries)
apps/storefront/app/profile/ProfileClient.tsx (Clerk hooks)
apps/storefront/app/checkout/actions.ts (Prisma)
apps/storefront/components/auth/LoginForm.tsx (may remove)
apps/storefront/components/auth/SignupForm.tsx (replace with profile form)
apps/storefront/components/Header.tsx (Clerk UI)
```

---

## Environment Variables

### Remove (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_WEBHOOK_SECRET
```

### Add (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/complete-profile
```

### Add (Prisma)
```
DATABASE_URL (Prisma Postgres connection string)
```

---

## Risk Mitigation

### Risk: Clerk webhook fails silently
**Mitigation**: Implement logging, monitor Clerk webhook dashboard, add Sanity sync retry logic

### Risk: Prisma connection issues in serverless
**Mitigation**: Use Prisma Accelerate for connection pooling, test thoroughly on Vercel

### Risk: Breaking changes during migration
**Mitigation**: Phase-based approach with checkpoints, can revert to Supabase branch if needed

### Risk: Missing edge cases in auth flows
**Mitigation**: Manual testing checklist for each auth scenario

### Risk: OAuth users bypass profile completion
**Mitigation**: Middleware enforces profile check; no access to protected routes without profile

---

## Dependencies

### NPM Packages to Add
```json
{
  "@clerk/nextjs": "^6.x",
  "@prisma/client": "^6.x",
  "svix": "^1.x"  // For webhook signature verification
}
```

### NPM Packages to Remove
```json
{
  "@supabase/ssr": "remove",
  "@supabase/supabase-js": "remove"
}
```

### Dev Dependencies to Add
```json
{
  "prisma": "^6.x"
}
```

---

## Post-Migration Notes

### FullStory Update Required
After migration is complete, update FullStory identification:

**Before (Supabase)**:
```typescript
FS.identify(user.id, { email: user.email })
// user.id = UUID format: "123e4567-e89b-12d3-a456-426614174000"
```

**After (Clerk)**:
```typescript
FS.identify(user.id, { email: user.primaryEmailAddress?.emailAddress })
// user.id = Clerk format: "user_2NNEqL2nrIRdJ194ndJqAHwEfxC"
```

The user ID format change may affect FullStory user continuity but since all data is being reset, this is acceptable.
