# FullStory Implementation Overview | Batch Theory Coffee Co

- Candidate: RC Maples
- Date: 12/22/2025
- FS Org Id: `o-248K4E-na1`
- Repo: https://github.com/rcmaples/btx
- Live site: https://batchtheory.exchange/

## Business Value Translation

This application is instrumented to ensure Fullstory captures meaningful business behavior, not just raw clicks and pageviews. By programmatically naming pages, events, and key UI elements with real product and commerce context, every session becomes immediately searchable and actionable for teams analyzing conversion, drop-off, and purchase intent. This specific implementation is designed to scale cleanly by wrapping things like page naming and custom events in reusable hooks. This makes it easy to extend without sacrificing data quality. In contrast, more manual analytics approaches often rely on scattered tagging and configuration, which can introduce inconsistency due to human error over time. This approach gives teams a faster path to answers with fewer blind spots and more confidence in what the data is actually showing. The behavioral data captured in FullStory becomes the foundation for improving products, refining user flows, and driving higher conversion by directly connecting user behavior to revenue outcomes.

---

## Application overview

For speed I chose to build a next.js app for the frontend while leveraging [Sanity](https://sanity.io) to manage content—products, editorial articals, promos, etc...
This app was build with the following tools:

- I scaffolded the app with a template generator I creadted previously (`npx create turbo-sanity` [[repo](https://github.com/rcmaples/create-turbo-sanity)])

- I used ChatGPT to generate the coffee selection, their descriptions, tasting notes, and 'best for' content.

- I used Sanity's AI Assist functionality to generate product images and image alt text.

- I used a combination of Claude Code in the terminal and Kilo Code inside VS Code with Sonnet and Opus models for prototyping and styling the front end.

- ~~I chose to use Supabase for managing user signup / authentication and checkout details in a centralized location~~.

- Supabase introduced a lot of complexity and overhead, as a result page loads were incredibly slow. Supabase was replaced by Clerk for authentication and a postgres database hosted by Prisma.

- Next.js, Supabase, and Sanity all have MCP servers which helped keep things on track within the Next.js app itself while also providing the LLMs a set of rules for Sanity best practices and agentic setup of Supabase. I might have been able to move quicker with something like MongoDB, but that would have required more setup for user auth. I haven't used Supabase much, but it simplified things even though it required a bit more effort.

- The app uses Tailwind CSS, Lucide icons when needed, and components based on ShadCN/Radix.

- The app is deployed to Vercel though could be wrapped in a docker container and deployed to Google Run or some other service. I went with Vercel to expedite deployment.

## What We Capture

### 1. Named Pages

- **Product Catalog** (`/products`)
- **Product Detail** (`/products/[slug]`) - Dynamic, e.g. "Product Detail: [Coffee Name]"
- **Shopping Cart** (`/cart`)
- **Checkout/Order Confirmation** (`/checkout`) - Conditional based on order state
- **Exchange Membership** (`/members`)
- **Release Notes** (`/release-notes`)
- **Release Notes Article** (`/release-notes`) - Dynamic, e.g. "Release Notes: [Article Title]"
- **404** (`/not-found`)
- **Bundles** (`/bundles`)
- **Bundle Detail** (`/bundles/[slug]`) - Dynamic, e.g. "Bundle: [Bundle Name]"
- **Profile Completion Page** (``)
- **Sign In**(`/login/[[...sign-in]]`)
- **Sign Up**(`/signup/[[...sign-up]]`)

### 2. Custom Events for adding to cart and transitioning to checkout

**_Note:_** _The assignment mentioned using type suffixes (e.g. `_str`). FullStory's documentation mentioned that is no longer required and FS would infer the types automatically. As a result, the first deployment shows custom event properties with two suffixes in FullStory (e.g. `product_sku_str_str`). I removed those suffixes on a subsequent deployment to clean things up in FS._

**Add to Cart**

```typescript
{
  product_sku: string,      // Product ID
  product_name: string,     // Product name
  quantity: number,         // Quantity added
  price: number,            // Price in dollars
  size: string,             // Selected size (e.g., "340g")
  grind: string             // Selected grind (e.g., "Whole bean")
}
```

**Checkout Initiated**

```typescript
{
  cart_value: number,       // Total cart value
  item_count: number,       // Number of items
  has_promotion: boolean,   // Whether promo applied
  promotion_code?: string   // Optional - promo code if present
}
```

### 3. Element naming for key interactions

- `add-to-cart-button` - Main conversion button
- `size-selector-button` - Product size selection
- `grind-selector-button` - Grind type selection
- `proceed-to-checkout-button` - Cart to checkout transition
- `place-order-button` - Final order submission
- `promo-code-input` - Promo code entry
- `roast-level-filter` - Product filtering
- `origin-filter` - Product filtering
- `process-method-filter` - Product filtering

### 4. Element Properties

- **Product Cards**: `product_id`, `product_name`, `roast_level`, `origin`

- **Size/Grind Selectors** `size_key`, `size_name`, `grind`, `price`, `is_selected`

- **Add to Cart Button**: `product_id`, `price`, `selected_size`, `selected_grind`

- **Cart/Checkout Summaries** `total_amount`, `item_count`, `has_promotion`, `discount_amount`

- **Promo Code Section** `promo_applied`, `promo_code`

### 5. User identification

- `identifyUser()` and `anonymizeUser()` utility functions on login / logout.

---

## Why We Capture

### Business Rationale

**Page Views**

- **Product Detail pages**: Identify which coffees generate most interest
- **Checkout flow**: Measure funnel drop-off points
- **Cart abandonment**: Track users who add items but don't complete purchase
- **Release notes articles**: Identify which articles are most engaging and lead to conversion
- **Profile completion**: Measure drop-off points in account setup

**Custom Events**

- **Add to Cart**: Core conversion metric; enables analysis of which products/sizes/grinds convert best
- **Checkout Initiated**: Measures intent to purchase vs. actual completion; critical for cart abandonment analysis

**Element Naming**

- Makes session replays searchable by business terms instead of generic "button" or "div"
- Enables targeted filtering in FullStory (e.g., "show me all sessions where users clicked size-selector-button")
- Facilitates rage click analysis on specific interactions

**Element Properties**

- **Product context**: Understand which products/origins/roasts users interact with
- **Selection context**: See what options users choose before adding to cart
- **Cart context**: Analyze cart value tiers and promo code usage patterns
- **A/B testing foundation**: Properties enable cohort analysis (e.g., "users who selected 340g vs 2lb")

### Technical Rationale

**Tracking at interaction points (not in global handlers)**

- Ensures we have full context (selected options, prices, etc.)
- Allows us to track after successful operations only (not failed attempts)
- More maintainable - tracking lives near business logic

**Dynamic properties over static**

- Properties update with user selections (e.g., `is_selected_bool` changes as users click)
- Captures state at moment of interaction
- Enables time-series analysis within single session

---

## How We Capture

To configure capture of things like custom events and page names, we've implemented custom hooks and created utility or helper functions. This approach allows for an easier and more consistent implementation as new products are added or as the site evolves over time. Utility functions enable the ability to call FullStory's API from event handlers or other conditional logic; storing them in a centralized place means developers don't need to write FS calls all over the codebase and reduces the chances of human error while increasing maintainability. The hook pattern allows us to pass specific context and avoid unnessecary re-renders within the app—providing a seamless user experience.

### Technical Details

**Architecture: Hybrid Hook + Utility Pattern**

```
┌─────────────────────────────────────────┐
│  Core Utilities Layer                   │
│  (lib/fullstory/utils.ts)               │
│  - Event tracking functions             │
│  - Type-safe wrappers                   │
│  - Helper utilities                     │
└─────────────────────────────────────────┘
              ↑
┌─────────────────────────────────────────┐
│  Hook Layer                             │
│  (lib/fullstory/hooks.ts)               │
│  - usePageName()                    │
└─────────────────────────────────────────┘
              ↑
┌─────────────────────────────────────────┐
│  Integration Layer                      │
│  (Components & Pages)                   │
│  - Import and call utilities            │
│  - Add data-fs-* attributes to JSX      │
└─────────────────────────────────────────┘
```

#### Code samples

**1a. Page Naming (Hook-based)**

```typescript
// lib/fullstory/hooks.ts
export function usePageName(pageName: string, dynamicSuffix?: string) {
  useEffect(() => {
    if (typeof window !== 'undefined' && FS) {
      const fullPageName = dynamicSuffix ? `${pageName}: ${dynamicSuffix}` : pageName

      FS('setProperties', {
        type: 'page',
        properties: {pageName: fullPageName},
      })
    }
  }, [pageName, dynamicSuffix])
}

// Usage in component
usePageName('Product Detail', product.name)
```

**1b. Page Naming (Server-rendered pages)**

```typescript
// components/common/FSPageName.tsx
export function FSPageName({pageName, dynamicSuffix}: Props) {
  usePageName(pageName, dynamicSuffix)
  return null
}

// Usage in Server Component
export default async function ProductPage() {
  const product = await getProduct()
  return (
    <div>
      <FSPageName pageName="Product Detail" dynamicSuffix={product.name} />
      {/* ... rest of content */}
    </div>
  )
}
```

**2. Event Capture (Utility functions)**

```typescript
// lib/fullstory/utils.ts
export function trackAddToCart(params: AddToCartEvent): void {
  if (typeof window !== 'undefined' && FS) {
    FS('trackEvent', {
      name: 'Add to Cart',
      properties: params,
    })
  }
}

// Usage in handler
const handleAddToCart = async () => {
  await addToCart(selectedPurchaseOption, 1)

  trackAddToCart({
    product_sku_str: selectedPurchaseOption.productId,
    quantity_int: 1,
    price_real: centsToReal(selectedPurchaseOption.priceInCents),
    // ...
  })
}
```

### Key Technical Decisions

**FullStory API Usage**

- Used `FS('trackEvent')` for custom events (standard API)
- Used `FS('setProperties', {type: 'page'})` for page naming (v2 API)
- The site makes use of static SSR pages. To account for this, FS API calls are wrapped in SSR-safe checks (`typeof window !== 'undefined'`)

**Error Handling**

- All FS calls wrapped in try-catch
- Errors logged but never break user experience
- Graceful degradation if FullStory fails to load

**Type Safety**

- TypeScript interfaces for all events
- Prevents runtime errors from typos

**Next.js App Router Constraints**

- Server components pass data to client wrappers
- Hooks used in client components to trigger tracking

---

## Alternative Options & Tradeoffs

### 1. Page Tracking Approaches

We could use custom hooks or rely on layout.tsx files.

Ultimately we chose hooks. They're explicit and flexible. Though, they do require adding the hook to each page.
Placing the call to `setPageName` in the layout makes things more automatic but removes the ability to specify dynamic page names.

### 2. Event Tracking Approaches

We could use component handlers, build another set of utility functions, or use a global event listener.

Component handlers provided the most flexibility and provides full context (e.g. prices, selections, etc...). Building a utility function can make things a bit more automatic and centralizes the logic, but you lose some context and firing calls conditionally becomes harder. Using global event listeners is not the best option here. While it does allow for broader use, its implementation would be overly complex; making it difficult to debug and could be subject to race conditions (i.e. the event fired before the listener is attached)

Using component handlers unlocked access to more compelling context for user interaction.

---

## Performance Considerations

**No Re-render Impact**

- Event tracking is fire-and-forget (called in handlers, not render)
- Page tracking uses `useEffect` (runs after render)
- Element attributes are inline (no extra renders)

**SSR Safety**

- All FS calls guarded by `typeof window !== 'undefined'`
- No hydration mismatches
- Works in Next.js App Router with server components
- We can explore server-side events in the future as an alternative.

**Error Isolation**

- Try-catch around all FS calls
- FS Failures never break UX
- Errors logged to console for debugging

---

_fin._
