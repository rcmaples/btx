import { sanityFetch, clientFetch, client } from './client';
import type {
  Product,
  Promotion,
  Article,
  FilterOptions,
  SanityBundle,
} from '@/lib/types';

// Re-export types that are used in return types for use in components
export type { SanityBundle } from '@/lib/types';

// ============================================================================
// Product Queries
// ============================================================================

export async function getProducts(filters?: {
  roastLevel?: string;
  origin?: string;
  processMethod?: string;
  bestFor?: string;
  isMember?: boolean;
  exclusiveOnly?: boolean;
}): Promise<Product[]> {
  // Show exclusive products only to members, non-exclusive products to everyone
  // When exclusiveOnly is true (member filter), only show exclusive products
  const query = `*[_type == "product"
    && (!defined(isExclusiveDrop) || isExclusiveDrop != true || $isMember == true)
    && ($exclusiveOnly != true || isExclusiveDrop == true)
    && ($roastLevel == null || roastLevel == $roastLevel)
    && ($origin == null || origin == $origin)
    && ($processMethod == null || processMethod == $processMethod)
    && ($bestFor == null || $bestFor in bestFor[])
  ] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    origin,
    roastLevel,
    processMethod,
    bestFor,
    flavorProfile,
    "images": images[imageType == "product"] {
      asset,
      imageType,
      alt,
      caption,
      hotspot,
      crop
    },
    image,
    productType,
    isExclusiveDrop
  }`;

  return sanityFetch<Product[]>(
    query,
    {
      roastLevel: filters?.roastLevel || null,
      origin: filters?.origin || null,
      processMethod: filters?.processMethod || null,
      bestFor: filters?.bestFor || null,
      isMember: filters?.isMember || false,
      exclusiveOnly: filters?.exclusiveOnly || false,
    },
    { revalidate: 600, tags: ['products'] }
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    origin,
    roastLevel,
    processMethod,
    bestFor,
    flavorProfile,
    "images": images[imageType == "product"] {
      asset,
      imageType,
      alt,
      caption,
      hotspot,
      crop
    },
    image,
    productType,
    isExclusiveDrop,
    availableSizes,
    availableGrinds,
    pricing[] {
      _key,
      sizeKey,
      sizeName,
      grams,
      priceInCents,
      isBasePrice
    }
  }`;

  return sanityFetch<Product | null>(query, { slug }, { revalidate: 600, tags: ['products'] });
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const query = `{
    "roastLevels": array::unique(*[_type == "product"].roastLevel),
    "origins": array::unique(*[_type == "product"].origin) | order(@),
    "processMethods": array::unique(*[_type == "product"].processMethod),
    "bestFor": array::unique(*[_type == "product"].bestFor[])
  }`;

  return sanityFetch<FilterOptions>(query, {}, { revalidate: 3600, tags: ['products'] });
}

// ============================================================================
// Client-Safe Product Queries (for use in client components/hooks)
// ============================================================================

export async function getProductsClient(filters?: {
  roastLevel?: string;
  origin?: string;
  processMethod?: string;
  bestFor?: string;
  isMember?: boolean;
  exclusiveOnly?: boolean;
}): Promise<Product[]> {
  const query = `*[_type == "product"
    && (!defined(isExclusiveDrop) || isExclusiveDrop != true || $isMember == true)
    && ($exclusiveOnly != true || isExclusiveDrop == true)
    && ($roastLevel == null || roastLevel == $roastLevel)
    && ($origin == null || origin == $origin)
    && ($processMethod == null || processMethod == $processMethod)
    && ($bestFor == null || $bestFor in bestFor[])
  ] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    origin,
    roastLevel,
    processMethod,
    bestFor,
    flavorProfile,
    "images": images[imageType == "product"] {
      asset,
      imageType,
      alt,
      caption,
      hotspot,
      crop
    },
    image,
    productType,
    isExclusiveDrop
  }`;

  return clientFetch<Product[]>(query, {
    roastLevel: filters?.roastLevel || null,
    origin: filters?.origin || null,
    processMethod: filters?.processMethod || null,
    bestFor: filters?.bestFor || null,
    isMember: filters?.isMember || false,
    exclusiveOnly: filters?.exclusiveOnly || false,
  });
}

export async function getProductBySlugClient(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    origin,
    roastLevel,
    processMethod,
    bestFor,
    flavorProfile,
    "images": images[imageType == "product"] {
      asset,
      imageType,
      alt,
      caption,
      hotspot,
      crop
    },
    image,
    productType,
    isExclusiveDrop,
    availableSizes,
    availableGrinds,
    pricing[] {
      _key,
      sizeKey,
      sizeName,
      grams,
      priceInCents,
      isBasePrice
    }
  }`;

  return clientFetch<Product | null>(query, { slug });
}

export async function getFilterOptionsClient(): Promise<FilterOptions> {
  const query = `{
    "roastLevels": array::unique(*[_type == "product"].roastLevel),
    "origins": array::unique(*[_type == "product"].origin) | order(@),
    "processMethods": array::unique(*[_type == "product"].processMethod),
    "bestFor": array::unique(*[_type == "product"].bestFor[])
  }`;

  return clientFetch<FilterOptions>(query, {});
}

// ============================================================================
// Promotion Queries
// ============================================================================

export async function getPromotionByCode(code: string): Promise<Promotion | null> {
  const query = `*[_type == "promotion" && code == $code && isActive == true][0] {
    _id,
    code,
    name,
    type,
    discountType,
    discountValue,
    "minSubtotalCents": minimumPurchase,
    validFrom,
    validUntil,
    isActive
  }`;

  return sanityFetch<Promotion | null>(
    query,
    { code: code.toUpperCase() },
    { revalidate: 300, tags: ['promotions'] }
  );
}

export async function getAutoPromotions(): Promise<Promotion[]> {
  const query = `*[_type == "promotion" && type == "auto" && isActive == true] | order(minimumPurchase desc) {
    _id,
    name,
    type,
    discountType,
    discountValue,
    "minSubtotalCents": minimumPurchase,
    validFrom,
    validUntil,
    isActive
  }`;

  return sanityFetch<Promotion[]>(query, {}, { revalidate: 300, tags: ['promotions'] });
}

// ============================================================================
// Article Queries
// ============================================================================

export async function getArticles(): Promise<Article[]> {
  const query = `*[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    author,
    excerpt,
    coverImage
  }`;

  return sanityFetch<Article[]>(query, {}, { revalidate: 600, tags: ['articles'] });
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const query = `*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    author,
    excerpt,
    body,
    coverImage,
    "featuredProducts": featuredProducts[]-> {
      _id,
      name,
      "slug": slug.current,
      description,
      origin,
      roastLevel,
      image
    }
  }`;

  return sanityFetch<Article | null>(query, { slug }, { revalidate: 600, tags: ['articles'] });
}

// ============================================================================
// Order Mutations
// ============================================================================

export async function createOrder(orderData: {
  orderNumber: string;
  lineItems: any[];
  subtotal: number;
  discount: number;
  total: number;
  appliedPromotion?: any;
}) {
  return client.create({
    _type: 'order',
    ...orderData,
    createdAt: new Date().toISOString(),
    isTestOrder: true,
  });
}

export async function getOrderByNumber(orderNumber: string) {
  const query = `*[_type == "order" && orderNumber == $orderNumber][0] {
    _id,
    orderNumber,
    lineItems,
    subtotal,
    discount,
    total,
    appliedPromotion,
    createdAt,
    isTestOrder
  }`;

  return sanityFetch(query, { orderNumber }, { revalidate: 0 });
}

// ============================================================================
// Bundle Queries
// ============================================================================

export async function getBundles(filters?: {
  isMember?: boolean;
}): Promise<SanityBundle[]> {
  // Show exclusive bundles only to members, non-exclusive bundles to everyone
  const query = `*[_type == "bundle"
    && isActive == true
    && (!defined(isExclusiveDrop) || isExclusiveDrop != true || $isMember == true)
    && (!defined(availableUntil) || availableUntil > now())
  ] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "products": items[].product-> {
      _id,
      name,
      "slug": slug.current,
      origin,
      roastLevel,
      availableGrinds,
      "images": images[imageType == "product"] {
        asset,
        imageType,
        alt,
        caption,
        hotspot,
        crop
      },
      image
    },
    price,
    savingsAmount,
    image,
    isExclusiveDrop,
    isActive,
    availableUntil
  }`;

  return sanityFetch<SanityBundle[]>(
    query,
    { isMember: filters?.isMember || false },
    { revalidate: 600, tags: ['bundles'] }
  );
}

export async function getBundleBySlug(slug: string): Promise<SanityBundle | null> {
  const query = `*[_type == "bundle" && slug.current == $slug && isActive == true][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    "products": items[].product-> {
      _id,
      name,
      "slug": slug.current,
      description,
      origin,
      roastLevel,
      processMethod,
      flavorProfile,
      availableGrinds,
      "images": images[imageType == "product"] {
        asset,
        imageType,
        alt,
        caption,
        hotspot,
        crop
      },
      image,
      productType
    },
    price,
    savingsAmount,
    image,
    isExclusiveDrop,
    isActive,
    availableUntil
  }`;

  return sanityFetch<SanityBundle | null>(query, { slug }, { revalidate: 600, tags: ['bundles'] });
}

// ============================================================================
// Client-Safe Bundle Queries (for use in client components/hooks)
// ============================================================================

export async function getBundlesClient(filters?: {
  isMember?: boolean
}): Promise<SanityBundle[]> {
  const query = `*[_type == "bundle"
    && isActive == true
    && (!defined(isExclusiveDrop) || isExclusiveDrop != true || $isMember == true)
    && (!defined(availableUntil) || availableUntil > now())
  ] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "products": items[].product-> {
      _id,
      name,
      "slug": slug.current,
      origin,
      roastLevel,
      availableGrinds,
      "images": images[imageType == "product"] {
        asset,
        imageType,
        alt,
        caption,
        hotspot,
        crop
      },
      image
    },
    price,
    savingsAmount,
    image,
    isExclusiveDrop,
    isActive,
    availableUntil
  }`

  return clientFetch<SanityBundle[]>(query, {
    isMember: filters?.isMember || false,
  })
}

export async function getBundleBySlugClient(slug: string): Promise<SanityBundle | null> {
  const query = `*[_type == "bundle" && slug.current == $slug && isActive == true][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    "products": items[].product-> {
      _id,
      name,
      "slug": slug.current,
      description,
      origin,
      roastLevel,
      processMethod,
      flavorProfile,
      availableGrinds,
      "images": images[imageType == "product"] {
        asset,
        imageType,
        alt,
        caption,
        hotspot,
        crop
      },
      image,
      productType
    },
    price,
    savingsAmount,
    image,
    isExclusiveDrop,
    isActive,
    availableUntil
  }`

  return clientFetch<SanityBundle | null>(query, {slug})
}

// ============================================================================
// Release Notes Queries (using Article type with filtering)
// ============================================================================

export async function getReleaseNotes(): Promise<Article[]> {
  const query = `*[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    author,
    excerpt,
    coverImage
  }`;

  return sanityFetch<Article[]>(query, {}, { revalidate: 600, tags: ['articles'] });
}

export async function getReleaseNoteBySlug(slug: string): Promise<Article | null> {
  return getArticleBySlug(slug);
}
