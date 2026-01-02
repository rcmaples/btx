import type {Cart, CartLineItem, Promotion, PurchaseSelection} from '@/lib/types'

/**
 * Sample purchase selection for testing addToCart
 */
export const mockPurchaseSelection: PurchaseSelection = {
  productId: 'product-123',
  productName: 'Ethiopia Yirgacheffe',
  sizeKey: '340g',
  sizeName: '340g (12oz)',
  grams: 340,
  grind: 'Whole Bean',
  priceInCents: 1895,
}

/**
 * Sample line item for testing storage functions
 */
export const mockLineItem: CartLineItem = {
  id: 'product-123-340g-wholebean',
  productId: 'product-123',
  productName: 'Ethiopia Yirgacheffe',
  sizeKey: '340g',
  sizeName: '340g (12oz)',
  grams: 340,
  grind: 'Whole Bean',
  quantity: 1,
  pricePerUnit: 1895,
  lineTotal: 1895,
}

/**
 * Second line item for multi-item cart tests
 */
export const mockLineItem2: CartLineItem = {
  id: 'product-456-1lb-ground',
  productId: 'product-456',
  productName: 'Colombia Supremo',
  sizeKey: '1lb',
  sizeName: '1lb (454g)',
  grams: 454,
  grind: 'Ground',
  quantity: 2,
  pricePerUnit: 2495,
  lineTotal: 4990,
}

/**
 * Sample bundle for testing addBundleToCart
 */
export const mockBundle = {
  _id: 'bundle-456',
  name: 'Discovery Pack',
  price: 4500,
  grind: 'Whole Bean',
  products: [
    {_id: 'product-123', name: 'Ethiopia Yirgacheffe'},
    {_id: 'product-456', name: 'Colombia Supremo'},
  ],
}

/**
 * Percentage-based promotion (10% off)
 */
export const mockPercentagePromo: Promotion = {
  _id: 'promo-10off',
  _type: 'promotion',
  code: 'SAVE10',
  name: '10% Off',
  type: 'manual',
  discountType: 'percentage',
  discountValue: 10,
  isActive: true,
}

/**
 * Fixed amount promotion ($5 off)
 */
export const mockFixedAmountPromo: Promotion = {
  _id: 'promo-5off',
  _type: 'promotion',
  code: 'FLAT5',
  name: '$5 Off',
  type: 'manual',
  discountType: 'fixed_amount',
  discountValue: 500, // $5.00 in cents
  isActive: true,
}

/**
 * Auto-apply promotion with minimum purchase
 */
export const mockAutoPromo: Promotion = {
  _id: 'promo-auto',
  _type: 'promotion',
  name: 'Free Shipping over $50',
  type: 'auto',
  discountType: 'fixed_amount',
  discountValue: 500,
  minSubtotalCents: 5000, // $50 minimum
  isActive: true,
}

/**
 * Manual promotion with minimum purchase requirement
 */
export const mockMinimumPurchasePromo: Promotion = {
  _id: 'promo-min',
  _type: 'promotion',
  code: 'MIN30',
  name: '15% off orders over $30',
  type: 'manual',
  discountType: 'percentage',
  discountValue: 15,
  minSubtotalCents: 3000, // $30 minimum
  isActive: true,
}

/**
 * Expired promotion for testing expiration validation
 */
export const mockExpiredPromo: Promotion = {
  _id: 'promo-expired',
  _type: 'promotion',
  code: 'EXPIRED',
  name: 'Expired Promo',
  type: 'manual',
  discountType: 'percentage',
  discountValue: 20,
  validUntil: new Date('2020-01-01'),
  isActive: true,
}

/**
 * Helper to create an empty test cart
 */
export function createTestCart(overrides?: Partial<Cart>): Cart {
  return {
    id: 'test-cart-123',
    lineItems: [],
    appliedPromotion: null,
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

/**
 * Helper to create a cart with items and calculated totals
 */
export function createCartWithItems(items: CartLineItem[]): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  return createTestCart({
    lineItems: items,
    subtotal,
    total: subtotal,
  })
}
