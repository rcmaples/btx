/**
 * Service Interfaces: MVP Storefront
 *
 * TypeScript interfaces for all service layer contracts.
 * These define the API between components and business logic services.
 */

// ============================================================================
// Data Types (from data-model.md)
// ============================================================================

// Purchase Options Types
export interface PriceEntry {
  _key: string;
  sizeKey: string; // e.g., "340g", "1lb", "2lb"
  sizeName: string; // Display name e.g., "340g (12oz)"
  grams: number; // Weight in grams for sorting
  priceInCents: number;
  isBasePrice?: boolean;
}

export interface PurchaseSelection {
  productId: string;
  productName: string;
  sizeKey: string;
  sizeName: string;
  grams: number;
  grind: string;
  priceInCents: number;
}

/**
 * Generate a deterministic cart item ID from selection data.
 * Normalizes grind to lowercase without spaces for URL/storage safety.
 */
export function generateCartItemId(
  productId: string,
  sizeKey: string,
  grind: string
): string {
  const normalizedGrind = grind.toLowerCase().replace(/\s+/g, '');
  return `${productId}-${sizeKey}-${normalizedGrind}`;
}

export interface Product {
  _id: string;
  _type: 'product';
  name: string;
  slug: string;
  description: any[]; // Portable Text blocks
  flavorProfile?: string[];
  origin: string;
  roastLevel: string;
  processMethod: string;
  bestFor?: string[];
  images?: ProductImage[];
  image?: SanityImage; // Legacy fallback for products not yet migrated
  productType: string;
  isExclusiveDrop?: boolean;
  // Purchase options
  availableSizes?: string[];
  availableGrinds?: string[];
  pricing?: PriceEntry[];
}

export interface Cart {
  id: string;
  lineItems: CartLineItem[];
  appliedPromotion: Promotion | null;
  subtotal: number; // Computed
  discount: number; // Computed
  total: number; // Computed
  createdAt: Date;
  updatedAt: Date;
}

export interface CartLineItem {
  id: string; // Format: {productId}-{sizeKey}-{normalizedGrind}
  productId: string;
  productName: string;
  sizeKey: string;
  sizeName: string;
  grams: number;
  grind: string;
  quantity: number;
  pricePerUnit: number; // USD cents
  lineTotal: number; // Computed: quantity × pricePerUnit
  itemType?: 'product' | 'bundle' | 'subscription';
  subscriptionDetails?: {
    cadence: 'weekly' | 'bi-weekly' | 'monthly';
    recurringPrice: number; // USD cents
  };
  bundleDetails?: {
    bundleId: string;
    bundleName: string;
    products: BundleProduct[];
  };
}

export interface Promotion {
  _id: string;
  _type: 'promotion';
  code?: string; // Required for manual promos
  name: string;
  type: 'manual' | 'auto';
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number; // Percentage (0-100) or amount in USD cents
  minSubtotalCents?: number; // Minimum order subtotal in USD cents (e.g., 3000 = $30.00)
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  products: BundleProduct[];
  bundlePrice?: number; // USD cents
  computedPrice: number; // Computed
}

export interface BundleProduct {
  productId: string;
  priceInCents: number;
  quantity: number;
}

export interface Subscription {
  id: string;
  productId: string;
  productName: string;
  sizeKey: string;
  sizeName: string;
  grams: number;
  grind: string;
  cadence: 'weekly' | 'bi-weekly' | 'monthly';
  recurringPrice: number; // USD cents
}

export interface Order {
  _id: string;
  _type: 'order';
  orderNumber: string;
  lineItems: OrderLineItem[];
  subtotal: number; // USD cents
  discount: number; // USD cents
  total: number; // USD cents
  appliedPromotion?: {
    code?: string;
    name: string;
    discountType: string;
    discountValue: number;
  };
  createdAt: Date;
  isTestOrder: boolean;
}

export interface OrderLineItem {
  id: string; // Format: {productId}-{sizeKey}-{normalizedGrind}
  productId: string;
  productName: string;
  sizeKey: string;
  sizeName: string;
  grams: number;
  grind: string;
  quantity: number;
  pricePerUnit: number; // USD cents
  lineTotal: number; // USD cents
  itemType: 'product' | 'bundle' | 'subscription';
}

export interface Membership {
  isMember: boolean;
  enrolledAt?: Date;
}

export interface Article {
  _id: string;
  _type: 'article';
  title: string;
  slug: string;
  publishedAt: Date;
  author?: string;
  excerpt?: string;
  body: any[]; // Portable Text blocks
  featuredProducts?: Product[];
  coverImage?: SanityImage;
}

export interface SanityBundle {
  _id: string;
  _type: 'bundle';
  name: string;
  slug: string;
  description: string;
  products: Product[];
  price: number; // USD cents
  savingsAmount?: number; // USD cents
  image?: SanityImage;
  isExclusiveDrop?: boolean;
  isActive: boolean;
  availableUntil?: Date;
}

export interface SanityImage {
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ProductImage extends SanityImage {
  imageType: 'product' | 'lifestyle';
  alt?: string;
  caption?: string;
}

// ============================================================================
// Product Service
// ============================================================================

export interface ProductService {
  /**
   * Get all products with optional filters
   * @param filters - Filter criteria (roast, origin, process, bestFor)
   * @param isMember - Whether user is Exchange member (for exclusive products)
   */
  getProducts(filters?: ProductFilters, isMember?: boolean): Promise<Product[]>;

  /**
   * Get single product by slug with all variants
   * @param slug - Product slug
   */
  getProductBySlug(slug: string): Promise<Product | null>;

  /**
   * Get filter options for UI
   */
  getFilterOptions(): Promise<FilterOptions>;
}

export interface ProductFilters {
  roastLevel?: 'Light' | 'Medium' | 'Dark';
  origin?: string;
  processMethod?: 'Washed' | 'Natural' | 'Honey';
  bestFor?: string;
  exclusiveOnly?: boolean;
}

export interface FilterOptions {
  roastLevels: string[];
  origins: string[];
  processMethods: string[];
  bestFor: string[];
}

// ============================================================================
// Cart Service
// ============================================================================

export interface CartService {
  /**
   * Get current cart from local storage
   */
  getCart(): Cart;

  /**
   * Add product selection to cart (or increment quantity if exists)
   * @param selection - Purchase selection with product and option details
   * @param quantity - Quantity to add (default: 1)
   */
  addToCart(selection: PurchaseSelection, quantity?: number): Promise<Cart>;

  /**
   * Remove item from cart
   * @param itemId - Cart item ID to remove
   */
  removeFromCart(itemId: string): Cart;

  /**
   * Update line item quantity
   * @param itemId - Cart item ID
   * @param quantity - New quantity (must be >= 1)
   */
  updateQuantity(itemId: string, quantity: number): Cart;

  /**
   * Clear entire cart
   */
  clearCart(): Cart;

  /**
   * Apply promotional code
   * @param code - Promo code to apply
   * @throws Error if code is invalid, expired, or cart doesn't meet minimum
   */
  applyPromoCode(code: string): Promise<Cart>;

  /**
   * Remove current promotion
   */
  removePromotion(): Cart;

  /**
   * Check for eligible auto-apply promotions
   * Automatically applies best matching promotion if found
   */
  checkAutoPromotions(): Promise<Cart>;

  /**
   * Persist cart to local storage
   * (Called automatically by mutation methods)
   */
  persistCart(cart: Cart): void;

  /**
   * Validate cart items against current inventory
   * Returns array of out-of-stock item IDs
   */
  validateInventory(): Promise<string[]>;
}


// ============================================================================
// Promotion Service
// ============================================================================

export interface PromotionService {
  /**
   * Validate and retrieve promotion by code
   * @param code - Promo code (case-insensitive)
   * @throws Error if code is invalid, expired, or inactive
   */
  getPromotionByCode(code: string): Promise<Promotion>;

  /**
   * Get active auto-apply promotions
   * Returns promotions ordered by minimum purchase (highest first)
   */
  getAutoPromotions(): Promise<Promotion[]>;

  /**
   * Calculate discount amount for promotion
   * @param subtotal - Cart subtotal in USD cents
   * @param promotion - Promotion to apply
   * @returns Discount amount in USD cents (0 if not eligible)
   */
  calculateDiscount(subtotal: number, promotion: Promotion): number;

  /**
   * Check if cart meets promotion minimum purchase requirement
   * @param subtotal - Cart subtotal in USD cents
   * @param promotion - Promotion to check
   */
  meetsMinimum(subtotal: number, promotion: Promotion): boolean;
}

// ============================================================================
// Order Service
// ============================================================================

export interface OrderService {
  /**
   * Create order from cart
   * @param cart - Current cart state
   * @returns Created order
   */
  createOrder(cart: Cart): Promise<Order>;

  /**
   * Get order by order number
   * @param orderNumber - Order number
   */
  getOrder(orderNumber: string): Promise<Order | null>;

  /**
   * Generate unique order number
   * Format: BT-{timestamp}-{random}
   */
  generateOrderNumber(): string;
}

// ============================================================================
// Membership Service
// ============================================================================

export interface MembershipService {
  /**
   * Get current membership status
   */
  getMembership(): Membership;

  /**
   * Enroll in Exchange membership
   * Sets session flag (no persistent user records)
   */
  enrollMembership(): Membership;

  /**
   * Check if user is member
   */
  isMember(): boolean;
}

// ============================================================================
// Article Service
// ============================================================================

export interface ArticleService {
  /**
   * Get all articles ordered by publish date (newest first)
   */
  getArticles(): Promise<Article[]>;

  /**
   * Get single article by slug with featured products
   * @param slug - Article slug
   */
  getArticleBySlug(slug: string): Promise<Article | null>;
}

// ============================================================================
// Bundle Service
// ============================================================================

export interface BundleService {
  /**
   * Create new bundle
   * @param name - Bundle name
   * @param products - Array of bundle products
   * @param bundlePrice - Optional special bundle price
   */
  createBundle(
    name: string,
    products: BundleProduct[],
    bundlePrice?: number
  ): Bundle;

  /**
   * Add bundle to cart as single line item
   * @param bundle - Bundle to add
   */
  addBundleToCart(bundle: Bundle): Promise<Cart>;

  /**
   * Remove unavailable products from bundle
   * @param bundle - Bundle to validate
   * @returns Updated bundle with unavailable products removed
   */
  removeUnavailableProducts(bundle: Bundle): Promise<Bundle>;
}

// ============================================================================
// Subscription Service
// ============================================================================

export interface SubscriptionService {
  /**
   * Create subscription configuration
   * @param selection - Purchase selection with product and option details
   * @param cadence - Delivery frequency
   */
  createSubscription(
    selection: PurchaseSelection,
    cadence: Subscription['cadence']
  ): Subscription;

  /**
   * Add subscription to cart
   * @param subscription - Subscription to add
   */
  addSubscriptionToCart(subscription: Subscription): Promise<Cart>;
}

// ============================================================================
// Checkout Service
// ============================================================================

export interface CheckoutService {
  /**
   * Process test checkout (no real payment)
   * Creates order and clears cart
   * @param cart - Current cart state
   * @returns Created order
   */
  processCheckout(cart: Cart): Promise<Order>;

  /**
   * Validate checkout prerequisites
   * @throws Error if cart is invalid (empty, out of stock items, etc.)
   */
  validateCheckout(cart: Cart): Promise<void>;
}

// ============================================================================
// Error Types
// ============================================================================

export class ProductNotFoundError extends Error {
  constructor(slug: string) {
    super(`Product not found: ${slug}`);
    this.name = 'ProductNotFoundError';
  }
}

export class ItemNotFoundError extends Error {
  constructor(id: string) {
    super(`Item not found: ${id}`);
    this.name = 'ItemNotFoundError';
  }
}

export class ItemOutOfStockError extends Error {
  constructor(id: string) {
    super(`Item out of stock: ${id}`);
    this.name = 'ItemOutOfStockError';
  }
}

export class InvalidPromoCodeError extends Error {
  constructor(code: string) {
    super(`Invalid promo code: ${code}`);
    this.name = 'InvalidPromoCodeError';
  }
}

export class PromoMinimumNotMetError extends Error {
  constructor(minimum: number) {
    super(
      `Cart does not meet promotion minimum: $${(minimum / 100).toFixed(2)}`
    );
    this.name = 'PromoMinimumNotMetError';
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super('Cannot checkout with empty cart');
    this.name = 'EmptyCartError';
  }
}
