This is straightforward to design for — especially if you plan for it from the start rather than retrofitting it later. The difficulty depends on how much the sites' content models **overlap vs. diverge**.

### The Spectrum of Multi-Workspace

There are three scenarios, each progressively more complex:

```
Scenario A                  Scenario B                   Scenario C
────────────────────        ────────────────────         ────────────────────
Same content types,         Shared core +                Completely different
different data              workspace-specific types     content models

Exchange: products          Exchange: products           Exchange: products,
Academy:  products          Academy:  courses,                     bundles
                                      lessons            Academy:  courses,
                                                                   lessons,
                                                                   enrollments

Difficulty: Low             Difficulty: Medium           Difficulty: Medium
```

BTX Exchange vs. BTX Academy is almost certainly **Scenario B** — they'll share some content types (articles, promotions, maybe images/media) but Academy would introduce its own types (courses, lessons, instructors, enrollments). This is the most common real-world case and it's very manageable.

### Database Design: Tenant Column + Workspace-Specific Tables

#### 1. Add a `workspaces` table

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String                          // "Batch Theory Exchange"
  slug        String   @unique                // "exchange"
  domain      String?                         // "batchtheory.com"
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("workspaces")
}
```

#### 2. Add `workspaceId` to shared content tables

```prisma
model Product {
  id          String    @id @default(cuid())
  workspaceId String
  name        String
  slug        String
  // ... all other fields unchanged

  @@unique([workspaceId, slug])   // Slugs unique per workspace, not globally
  @@index([workspaceId])
  @@map("products")
}

model Article {
  id          String    @id @default(cuid())
  workspaceId String
  title       String
  slug        String
  // ...

  @@unique([workspaceId, slug])
  @@index([workspaceId])
  @@map("articles")
}

// Same pattern for: bundles, promotions, lookup tables
```

#### 3. Workspace-specific tables are just normal tables

When Academy needs `courses`, you add a `courses` table. It has a `workspaceId` column like everything else, but in practice it's only populated by the Academy workspace. No special infrastructure needed — it's just a table that one workspace uses and others don't.

```prisma
// Only used by Academy workspace, but structurally identical to any other table
model Course {
  id          String   @id @default(cuid())
  workspaceId String
  title       String
  slug        String   @unique
  // ... academy-specific fields

  @@index([workspaceId])
  @@map("courses")
}
```

#### 4. All queries filter by workspace

Every data access function takes a workspace context:

```typescript
// Before (single-tenant)
async function getProducts(filters?: ProductFilters) {
  return prisma.product.findMany({
    where: {roastLevel: filters?.roastLevel},
    orderBy: {name: 'asc'},
  })
}

// After (multi-tenant) — one additional WHERE clause
async function getProducts(workspaceId: string, filters?: ProductFilters) {
  return prisma.product.findMany({
    where: {workspaceId, roastLevel: filters?.roastLevel},
    orderBy: {name: 'asc'},
  })
}
```

This is the only data-layer change. Every query gets a `workspaceId` filter. Prisma middleware can enforce this automatically if you want a safety net:

```typescript
prisma.$use(async (params, next) => {
  // Ensure workspaceId is always included in queries for tenant-scoped models
  if (TENANT_SCOPED_MODELS.includes(params.model) && params.args.where) {
    if (!params.args.where.workspaceId) {
      throw new Error(`Query on ${params.model} missing workspaceId`)
    }
  }
  return next(params)
})
```

### Admin UI Design

#### Route Structure

```
/admin
├── /admin/select-workspace          ← Workspace picker (landing page)
│
├── /admin/exchange/                  ← Exchange workspace
│   ├── products/
│   ├── bundles/
│   ├── articles/
│   ├── promotions/
│   └── configuration/
│
├── /admin/academy/                   ← Academy workspace
│   ├── courses/
│   ├── lessons/
│   ├── articles/                     ← Same component, different data
│   └── configuration/
│
└── /admin/settings/                  ← Cross-workspace admin settings
    └── workspaces/                   ← Manage workspaces themselves
```

In Next.js App Router, this maps cleanly to a dynamic route segment:

```
app/admin/[workspace]/
├── layout.tsx              ← Workspace context provider + nav
├── products/page.tsx       ← Products list (shared)
├── bundles/page.tsx        ← Bundles list (Exchange only)
├── courses/page.tsx        ← Courses list (Academy only)
├── articles/page.tsx       ← Articles list (shared)
└── configuration/page.tsx  ← Config page (shared)
```

#### Workspace Context

A single layout component provides the workspace context for everything below it:

```typescript
// app/admin/[workspace]/layout.tsx
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspace: string }
}) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspace },
  })

  if (!workspace) notFound()

  return (
    <WorkspaceProvider workspace={workspace}>
      <AdminSidebar navigation={getNavigationForWorkspace(workspace)} />
      <main>{children}</main>
    </WorkspaceProvider>
  )
}
```

#### Dynamic Navigation

Each workspace defines which content types it uses:

```typescript
// Workspace-specific navigation config
const WORKSPACE_NAV: Record<string, NavItem[]> = {
  exchange: [
    {label: 'Products', href: 'products', icon: Coffee},
    {label: 'Bundles', href: 'bundles', icon: Package},
    {label: 'Articles', href: 'articles', icon: FileText},
    {label: 'Promotions', href: 'promotions', icon: Tag},
    {label: 'Configuration', href: 'configuration', icon: Settings},
  ],
  academy: [
    {label: 'Courses', href: 'courses', icon: GraduationCap},
    {label: 'Lessons', href: 'lessons', icon: BookOpen},
    {label: 'Articles', href: 'articles', icon: FileText},
    {label: 'Configuration', href: 'configuration', icon: Settings},
  ],
}
```

This config could also live in the database (a `workspace_content_types` table) if you want it fully dynamic, but a code-based config is simpler and sufficient for a handful of workspaces.

#### Workspace Switcher

A dropdown in the admin header — identical to how Sanity Studio's workspace switcher works:

```
┌──────────────────────────────────────────────────┐
│  [☕ Exchange ▾]              Admin    [User ▾]   │
│──────────────────────────────────────────────────│
│  Products │  Product List                        │
│  Bundles  │  ┌─────────────────────────────────┐ │
│  Articles │  │  Ethiopia Yirgacheffe            │ │
│  Promos   │  │  Colombia Huila                  │ │
│  Config   │  │  ...                             │ │
│           │  └─────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### What About Cross-Workspace Content?

If an article should appear on both Exchange and Academy, you have two options:

1. **Duplicate** — each workspace has its own copy. Simpler, independent editing.
2. **Shared content table** — a separate `shared_articles` table with a many-to-many `workspace_articles` junction. More complex, but content is authored once.

For a POC, option 1 is the right call. You can add cross-workspace sharing later if it's actually needed.

### Effort Estimate

| Task                                     | If designed from the start | If retrofitted later                 |
| ---------------------------------------- | -------------------------- | ------------------------------------ |
| `workspaces` table + seed data           | 30 minutes                 | 30 minutes                           |
| Add `workspaceId` to all content tables  | 1–2 hours                  | 1–2 hours + data migration           |
| Workspace route segment + layout         | 1–2 hours                  | 2–3 hours (refactor existing routes) |
| Workspace context provider               | 1 hour                     | 1 hour                               |
| Dynamic navigation config                | 1–2 hours                  | 2–3 hours                            |
| Update all queries with workspace filter | 2–3 hours                  | 4–6 hours (touch every query)        |
| Workspace switcher UI                    | 1–2 hours                  | 1–2 hours                            |
| **Total**                                | **~1–2 days**              | **~2–4 days**                        |

The key takeaway: if you add `workspaceId` to your tables and route structure now (even with only one workspace), the second workspace is nearly free. If you build single-tenant first and add it later, it's a straightforward but tedious refactor touching every query and route.

My recommendation: include `workspaceId` in the schema from day one and seed a single "exchange" workspace. The column costs nothing, and it saves you the retrofit.
