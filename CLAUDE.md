# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BTX (Batch Theory Exchange) is a specialty coffee e-commerce platform. It's a **Turborepo monorepo** with two apps: a Next.js storefront and a Sanity Studio CMS.

## Commands

```bash
# Development (starts both Next.js on :3000 and Sanity Studio on :3333)
pnpm dev

# Build, lint, typecheck (all via Turborepo)
pnpm build
pnpm lint
pnpm lint:fix
pnpm typecheck

# Unit tests (Vitest, from root or apps/storefront)
pnpm test
pnpm --filter storefront test:watch
pnpm --filter storefront test:coverage

# E2E tests (Playwright, Chromium only, auto-starts dev server)
pnpm --filter storefront test:e2e
pnpm --filter storefront test:e2e:ui       # interactive UI mode
pnpm --filter storefront test:e2e:headed   # visible browser

# Formatting
pnpm format

# Database (run from apps/storefront)
pnpm prisma migrate dev --name "description"
pnpm prisma generate    # also runs automatically on postinstall

# Sanity types (after schema changes in apps/studio)
pnpm sanity:typegen
```

## Architecture

### Monorepo Structure

- `apps/storefront` — Next.js 16 App Router storefront (React 19, Turbopack dev)
- `apps/studio` — Sanity Studio v5 CMS for managing products, bundles, promotions, articles
- `packages/eslint-config` — shared ESLint configuration
- `packages/typescript-config` — shared tsconfig base files

Package manager is **pnpm 10.26.2**. Node 22.

### Data Split: Sanity vs Prisma

Product/content data lives in **Sanity** (products, bundles, promotions, articles, customers). User/order data lives in **Prisma/PostgreSQL** (profiles, orders). These are separate systems — Sanity is the product catalog, Prisma is the transactional store.

Prisma uses **Prisma Accelerate** for serverless connection pooling. Generated client output goes to `apps/storefront/generated/prisma`.

### Storefront Layers

**Services** (`lib/services/`) — Domain logic organized by feature: `cart/`, `product/`, `order/`, `bundle/`, `subscription/`, `membership/`. Each service implements interfaces from `lib/types/index.ts`. Cart state persists to localStorage and syncs across components via a custom `CART_UPDATED_EVENT`.

**Sanity client/queries** (`lib/services/sanity/`) — GROQ queries for all product/content data. `client.ts` for reads (CDN-cached), `write-client.ts` for mutations.

**Hooks** (`lib/hooks/`) — React hooks wrapping services with TanStack React Query: `useCart`, `useProducts`, `useBundles`, `useMembership`, `useProfile`.

**Providers** (`lib/providers/`) — `QueryProvider` (React Query with 5min stale time) and `ThemeProvider` (light/dark/system with localStorage persistence).

**Server actions** (`lib/actions/`) — `profile.ts` for profile creation. Checkout actions live in route-level `actions.ts` files.

### Auth Flow (Clerk)

- Sign-up redirects to `/complete-profile` where the user fills a form that creates a Prisma Profile + Sanity Customer document
- Profile creation is NOT automatic on `user.created` — it's manual via the form (avoids race conditions)
- Clerk webhook at `/api/webhooks/clerk` handles `user.deleted` (soft-deletes in Sanity)
- Webhook signature verified with Svix; separate secrets for prod (`CLERK_WEBHOOK_SECRET`) and dev (`CLERK_LOCAL_WEBHOOK_SECRET`)

### Payments (Stripe, test mode)

Stripe Elements in checkout. Payment intent created server-side, confirmed client-side. On success, creates an Order in Prisma.

### Styling

Tailwind CSS 3 with custom design tokens in `tailwind.config.ts`. CSS variables in `globals.css` for light/dark mode (toggled by `.dark` class on `<html>`). Custom UI components in `components/ui/`.

### Code Style

Prettier config: no semicolons, single quotes, no bracket spacing, 100 char print width. Path alias `@/` maps to `apps/storefront/`.

## Testing

**Unit tests**: Vitest with jsdom. Tests in `lib/__tests__/` with `.test.ts` extension. Fixtures in `lib/__tests__/fixtures.ts`, Sanity query mocks in `lib/__tests__/mocks/`.

**E2E tests**: Playwright, Chromium only. Tests in `e2e/` with `.spec.ts` extension. Dev server auto-starts. CI runs with 1 worker and 2 retries.

## CI

GitHub Actions on push/PR to main: lint+typecheck, test (Vitest), build. All three must pass.
