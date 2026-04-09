# Sanity to PostgreSQL Migration — Architecture Decisions

> Decision record from initial planning discussions. Covers the migration of BTX's
> content management from Sanity CMS to a self-managed PostgreSQL database with a
> custom Next.js admin interface.

**Date:** 2026-04-09
**Status:** Planning / Pre-POC

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Database Choice: PostgreSQL over Document Store](#2-database-choice-postgresql-over-document-store)
- [3. Rich Text: Standalone Portable Text Editor](#3-rich-text-standalone-portable-text-editor)
- [4. Database Schema Design](#4-database-schema-design)
- [5. Image Storage Strategy](#5-image-storage-strategy)
- [6. Infrastructure Phasing](#6-infrastructure-phasing)
- [7. Admin UI: Configuration Page](#7-admin-ui-configuration-page)
- [8. What Gets Eliminated](#8-what-gets-eliminated)

---

## 1. Overview

BTX currently splits data across two backends:

| Backend                                         | Stores                                                                          | Accessed By                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Sanity** (Content Lake)                       | Products, bundles, articles, promotions, customers, configuration/lookup tables | Storefront reads via GROQ, admin edits via Sanity Studio |
| **Prisma / PostgreSQL** (via Prisma Accelerate) | Profiles, orders                                                                | Storefront reads/writes via Prisma Client                |

Customer data is **duplicated** — written to Prisma first, then fire-and-forget synced to Sanity
so it's visible in Studio. This sync is best-effort with no retry mechanism and can silently drift.

**Goal:** Consolidate everything into a single PostgreSQL database. Replace Sanity Studio with a
custom Next.js admin app. Eliminate the dual-write pattern and Sanity dependency entirely.

---

## 2. Database Choice: PostgreSQL over Document Store

**Decision:** Use PostgreSQL (relational). Do not use a document store (Firestore, MongoDB, etc.).

### Rationale

**The data is already relational.** Five GROQ queries use Sanity's `->` dereference operator,
which is functionally a JOIN:

- `items[].product->` — bundles reference products
- `featuredProducts[]->` — articles reference products
- `applicableProducts[]->` / `excludedProducts[]->` — promotions reference products

A document store would force either denormalization (duplicating product data inside every bundle)
or application-level joins (multiple round trips per query).

**Access patterns favor SQL:**

- Product filtering by multiple fields → `WHERE` clauses
- Filter option extraction → `SELECT DISTINCT`
- Promotional code lookup with date-range validation → `WHERE` with comparison operators
- Order creation with profile foreign key → transactional integrity

**Scale does not justify a document store.** BTX has hundreds of products and thousands of orders.
PostgreSQL on a minimal instance handles this for years without tuning.

**Prisma compatibility.** Prisma has full PostgreSQL support. Prisma does not support Firestore
and has limited MongoDB support.

### JSONB for Semi-Structured Data

PostgreSQL `JSONB` columns handle the document-like portions of the data model:

- `Product.description` — Portable Text blocks
- `Product.pricing` — array of price entries per size
- `Product.images` — array of image objects with metadata
- `Product.faqs` — array of question/answer pairs
- `Article.body` — Portable Text blocks
- `Order.lineItems` — snapshot of cart at time of purchase

These are always read/written as a unit with their parent row and never queried independently.

---

## 3. Rich Text: Standalone Portable Text Editor

**Decision:** Use `@portabletext/editor` — the official standalone Portable Text editor extracted
from Sanity Studio. Store content as Portable Text JSON in JSONB columns.

### Packages

| Package                            | Purpose                                                                |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `@portabletext/editor`             | Core editor: `EditorProvider`, `PortableTextEditable`, event system    |
| `@portabletext/toolbar`            | Headless toolbar hooks: `useDecoratorButton`, `useStyleSelector`, etc. |
| `@portabletext/keyboard-shortcuts` | Built-in shortcuts (bold, italic, h1–h6, etc.)                         |
| `@portabletext/schema`             | `defineSchema()` for type-safe editor schema definitions               |
| `@portabletext/react`              | Rendering (already used by the storefront — no changes needed)         |

### Why This Works

- The editor is MIT-licensed, React-based, and has **zero Sanity backend dependencies**
- Output is native Portable Text JSON — the same format currently stored in Sanity
- The storefront's existing `@portabletext/react` rendering code requires **no changes**
- Schema definition is code-first via `defineSchema()`, matching the code-first approach
  used in the current Sanity Studio schemas
- The toolbar is headless — can be styled with existing Tailwind components

### Schema Configuration

Product descriptions and article bodies use the same Portable Text schema:

- **Styles:** normal, h1, h2, h3, blockquote
- **Decorators:** strong, em, code
- **Annotations:** link (with `href` field)
- **Lists:** bullet, number
- **Block objects (articles only):** image (with alt, caption)

---

## 4. Database Schema Design

**16 tables total** — 2 existing (profiles, orders) + 14 new.

### Entity Relationship Overview
