# Constitution: Supabase to Clerk + Prisma Migration

## Project Principles

### 1. Clean Break, Not a Migration

- All Supabase data is disposable; we are building fresh
- No backwards compatibility shims or legacy code paths
- Remove all Supabase code completely before adding Clerk/Prisma

### 2. Minimal Dependency Footprint

- Use official SDKs only: `@clerk/nextjs`, `@prisma/client`
- Avoid wrapper libraries or abstractions unless they provide clear value
- Leverage Next.js App Router patterns (Server Components, Server Actions)

### 3. Type Safety First

- Prisma provides generated types; use them throughout
- Clerk provides TypeScript types; leverage them
- No `any` types; no type assertions without justification

### 4. Security by Default

- Clerk handles authentication; trust their security model
- Use Clerk's middleware for route protection (not custom middleware)
- Validate all inputs in Server Actions before database operations
- Never expose database IDs in URLs when Clerk user IDs suffice

### 5. Vercel-Ready from Day One

- Environment variables must work in both local and Vercel environments
- Use Prisma connection pooling for serverless (Prisma Accelerate or PgBouncer)
- Consider edge runtime compatibility for middleware

### 6. Preserve Business Logic, Replace Infrastructure

- Exchange membership feature must work identically
- Guest checkout flow must be preserved
- Order creation flow must remain functional
- Sanity CMS sync must continue (via Clerk webhooks)

### 7. Incremental Verification

- Each phase must be testable independently
- Build and type-check must pass after each major change
- Manual testing checkpoints after auth, database, and integration phases

## Non-Goals

- Migrating existing user data (greenfield)
- Adding new features during migration
- Changing the UI/UX of auth flows
- Modifying Sanity CMS schema or integration patterns
