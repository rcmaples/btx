# Architect Prompt: Sanity → PostgreSQL Migration

## Objective

Plan and implement the migration of BTX from a dual-backend architecture (Sanity CMS + Prisma/PostgreSQL) to a single PostgreSQL database with a custom Next.js admin app. This is a POC — focus on correctness and clean architecture over polish.

## Context

Read these files before starting:

- `CLAUDE.md` — Project overview, architecture, commands, conventions
- `docs/SANITY-MIGRATION.md` — All architecture decisions, database schema, image strategy, infrastructure phasing
- `docs/MULTI-WORKSPACE.md` — Multi-workspace design (workspaceId on all content tables from day one)

The two decision docs are the source of truth. Every schema design, technology choice, and phasing decision has already been made. Do not revisit or change these decisions — implement them.

## Current State

### Data Backends

| Backend               | What it stores                                                                 | Key files                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sanity**            | Products, bundles, articles, promotions, customers, 6 config/lookup singletons | `apps/studio/src/schemaTypes/**/*` (source schemas), `lib/services/sanity/queries.ts` (all GROQ queries), `lib/sanity/write-client.ts` (customer sync) |
| **Prisma/PostgreSQL** | Profiles (2 models: Profile, Order)                                            | `apps/storefront/prisma/schema.prisma`, `lib/prisma.ts`, `lib/actions/profile.ts`, `app/checkout/actions.ts`                                           |

### Sanity Schema Types (complete inventory)

**Documents:** `product`, `bundle`, `article`, `promotion`, `customer`
**Singletons:** `configuration`, `productTypes`, `processMethods`, `roastLevels`, `coffeeDrinks`, `grindTypes`, `availableSizes`
**Objects:** `bundleItem`

### Files That Read from Sanity (must be migrated to Prisma)

- `lib/services/sanity/queries.ts` — 17 GROQ query functions (products, bundles, articles, promotions, orders, filter options)
- `lib/services/product/product-service.ts` — delegates to sanity queries
- `lib/services/bundle/bundle-service.ts` — delegates to sanity queries
- `lib/services/order/order-service.ts` — creates orders in Sanity (duplicate of Prisma order)
- `lib/sanity/write-client.ts` — customer dual-write sync to Sanity
- `lib/actions/profile.ts` — `syncProfileToSanity()`, `upsertCustomer()`, `updateCustomerMembership()` calls

### Files That Reference Sanity Images (must swap urlFor → direct URL)

- `lib/sanity/image.ts` — `urlFor()` builder
- `lib/sanity/utils.ts` — `urlForImage()` builder
- `components/product/ProductImage.tsx`
- `components/product/ProductCard.tsx`
- `components/bundle/BundleCard.tsx`
- `components/bundle/BundleProductSelector.tsx`
- `components/article/ArticleCard.tsx`
- `components/article/ArticleBody.tsx`
- `app/bundles/[slug]/BundleDetailClient.tsx`
- `app/layout.tsx` — Sanity CDN preconnect link

## Target State

- Single PostgreSQL database (existing Prisma Accelerate instance)
- All content managed via Prisma — no Sanity dependency
- `apps/studio/` deleted entirely
- Customer data consolidated into existing `profiles` table (no more dual-write)
- Sanity image asset refs resolved to CDN URLs stored in JSONB
- Multi-workspace ready (`workspaceId` on all content tables, seeded with one "exchange" workspace)

## Implementation Plan

Break this into the following phases. Each phase must result in a working, testable state. Create a task list with sub-tasks for each phase.

### Phase 1: Database Schema

Extend `apps/storefront/prisma/schema.prisma` with all new models per `docs/SANITY-MIGRATION.md` section 4, incorporating `workspaceId` per `docs/MULTI-WORKSPACE.md`.

Specific requirements:

- Add `Workspace` model
- Add 6 lookup tables: `ProductType`, `ProcessMethod`, `RoastLevel`, `CoffeeDrink`, `GrindOption`, `PackageSize`
- Add `Product` model with JSONB fields for `description`, `pricing`, `images`, `faqs`
- Add `Bundle` model + `BundleItem` junction table
- Add `Article` model + `ArticleFeaturedProduct` junction table
- Add `Promotion` model + `PromotionApplicableProduct` and `PromotionExcludedProduct` junction tables
- Add `accountClosed` and `accountClosedAt` fields to existing `Profile` model
- All content tables get `workspaceId String` + `@@index([workspaceId])` + compound unique constraints where applicable (e.g., `@@unique([workspaceId, slug])`)
- `Workspace` has a relation to content tables (optional — can just be a string FK for simplicity)
- Run `prisma migrate dev --name "add_content_catalog"` to verify the migration applies cleanly
- Run `prisma generate` to verify the client generates without errors

### Phase 2: Seed Data

Create `apps/storefront/prisma/seed.ts`:

1. Create the "exchange" workspace
2. Populate the 6 lookup tables with their initial values (copy from the Sanity singleton `initialValue` arrays in `apps/studio/src/schemaTypes/singletons/`)
3. Create a few sample products, bundles, articles, and promotions for testing
4. Wire up the seed script in `package.json` (`"prisma": {"seed": "..."}`)

### Phase 3: Data Migration Script

Create `scripts/migrate-sanity-data.ts` (or similar):

1. Read all documents from Sanity (products, bundles, articles, promotions, customers)
2. For each Sanity image asset reference, resolve it to a full `https://cdn.sanity.io/...` URL using the `@sanity/image-url` builder
3. Transform Sanity documents to match the new Prisma models
4. Insert into PostgreSQL via Prisma client
5. Map Sanity `_id` references to new Prisma `id` values for junction tables (bundle items, article featured products, promotion product references)
6. Log a summary of migrated records and any failures

This script is run once and can be deleted after migration is verified.

### Phase 4: Service Layer Migration

Replace all Sanity query functions with Prisma equivalents. The service interface contracts in `lib/types/index.ts` should NOT change — only the implementations.

1. Create `lib/services/prisma/queries.ts` (or refactor `lib/services/sanity/queries.ts` in place) with Prisma equivalents of every function currently in `lib/services/sanity/queries.ts`
2. Every query function that returns content data must accept and filter by `workspaceId`
3. Update `lib/services/product/product-service.ts` to use Prisma queries
4. Update `lib/services/bundle/bundle-service.ts` to use Prisma queries
5. Update `lib/services/order/order-service.ts` to remove the duplicate Sanity order creation — orders already go to Prisma via `app/checkout/actions.ts`
6. Update `lib/actions/profile.ts`:
   - Remove `syncProfileToSanity()` function
   - Remove `upsertCustomer()`, `updateCustomerProfile()`, `updateCustomerMembership()` calls
   - Add `accountClosed`/`accountClosedAt` field updates to the profile model where the Sanity `closeCustomerAccount()` was used
7. Update `app/api/webhooks/clerk/route.ts` to soft-delete in Prisma instead of calling `closeCustomerAccount()` from Sanity write-client
8. All existing unit tests in `lib/__tests__/` must continue to pass (update mocks as needed)

### Phase 5: Image URL Migration

1. Create a new helper `lib/image.ts` that replaces `lib/sanity/image.ts` and `lib/sanity/utils.ts`:
   - Export a function that takes a stored image object `{url, alt, hotspot, crop, ...}` and returns the URL directly
   - Export an `resolveOpenGraphImage()` equivalent
2. Update all 9 components that reference `urlFor()` or `urlForImage()` to use the new helper
3. Remove the `<link rel="preconnect" href="https://cdn.sanity.io">` from `app/layout.tsx` (images will use `next/image` which handles its own preconnects)
4. Ensure `next.config.ts` has `cdn.sanity.io` in `images.remotePatterns` (the existing Sanity images will still be served from there)

### Phase 6: Cleanup

1. Delete `apps/studio/` entirely
2. Delete `lib/sanity/` directory (write-client.ts, image.ts, utils.ts, fetch.ts, api.ts)
3. Delete `lib/services/sanity/` directory (client.ts, queries.ts)
4. Remove all Sanity-related environment variables from `.env.example`
5. Remove Sanity dependencies from `apps/storefront/package.json`: `@sanity/client`, `@sanity/image-url`, `@sanity/vision`, and any other `@sanity/*` packages
6. Remove the `apps/studio` workspace from the root `pnpm-workspace.yaml` (or `turbo.json` pipeline entries)
7. Update `CLAUDE.md` to reflect the new architecture (single database, no Sanity, admin app planned)
8. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` — all must pass with zero errors

## Constraints

- **Do not change the storefront's public API or user-facing behavior.** The migration is a backend swap. Pages, routes, components, and rendered output must remain identical.
- **Do not change the service interface contracts** in `lib/types/index.ts`. The `ProductService`, `BundleService`, `OrderService`, etc. interfaces are consumed by hooks and components. Only change the implementations behind them.
- **Portable Text content format does not change.** The JSONB columns store the same Portable Text JSON that Sanity stored. `@portabletext/react` rendering in the storefront requires zero changes.
- **Preserve the existing Prisma Accelerate setup.** The `accelerateUrl` pattern in `lib/prisma.ts` and the `DIRECT_URL` in `prisma.config.ts` remain as-is. This migration adds tables to the existing database.
- **Follow existing code style.** No semicolons, single quotes, no bracket spacing, 100 char print width. Use the existing path alias `@/` for imports.
- **The admin app (`apps/admin`) is NOT part of this migration.** This prompt covers only the database migration and storefront refactor. The admin UI is a separate future effort.
- **Do not introduce new dependencies** beyond what's needed for the seed/migration scripts. The storefront should have fewer dependencies after this migration, not more.
