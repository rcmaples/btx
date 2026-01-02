import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mockBundle, mockPurchaseSelection} from '../fixtures'

// Mock Sanity queries before importing cart service
vi.mock('@/lib/services/sanity/queries', () => ({
  getPromotionByCode: vi.fn().mockResolvedValue(null),
  getAutoPromotions: vi.fn().mockResolvedValue([]),
}))

// Import after mocking
const {cartService} = await import('@/lib/services/cart/cart-service')

describe('CartService', () => {
  beforeEach(() => {
    // Clear cart before each test
    cartService.clearCart()
  })

  describe('addToCart', () => {
    it('creates correct line item structure', async () => {
      const cart = await cartService.addToCart(mockPurchaseSelection, 1)

      expect(cart.lineItems).toHaveLength(1)
      const item = cart.lineItems[0]

      expect(item?.id).toBe('product-123-340g-wholebean')
      expect(item?.productId).toBe('product-123')
      expect(item?.productName).toBe('Ethiopia Yirgacheffe')
      expect(item?.sizeKey).toBe('340g')
      expect(item?.sizeName).toBe('340g (12oz)')
      expect(item?.grams).toBe(340)
      expect(item?.grind).toBe('Whole Bean')
      expect(item?.quantity).toBe(1)
      expect(item?.pricePerUnit).toBe(1895)
      expect(item?.lineTotal).toBe(1895)
    })

    it('deduplicates by size and grind (increments quantity)', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)
      const cart = await cartService.addToCart(mockPurchaseSelection, 2)

      expect(cart.lineItems).toHaveLength(1)
      expect(cart.lineItems[0]?.quantity).toBe(3) // 1 + 2
      expect(cart.lineItems[0]?.lineTotal).toBe(5685) // 3 * 1895
    })
  })

  describe('addBundleToCart', () => {
    it('creates bundle line item with bundleDetails', async () => {
      const cart = await cartService.addBundleToCart(mockBundle)

      expect(cart.lineItems).toHaveLength(1)
      const item = cart.lineItems[0]

      expect(item?.itemType).toBe('bundle')
      expect(item?.bundleDetails).toBeDefined()
      expect(item?.bundleDetails?.bundleId).toBe('bundle-456')
      expect(item?.bundleDetails?.bundleName).toBe('Discovery Pack')
      expect(item?.bundleDetails?.products).toHaveLength(2)
      expect(item?.pricePerUnit).toBe(4500)
    })
  })

  describe('removeFromCart', () => {
    it('removes item and recalculates totals', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)
      const cartBefore = cartService.getCart()

      expect(cartBefore.lineItems).toHaveLength(1)
      expect(cartBefore.subtotal).toBe(1895)

      const cartAfter = cartService.removeFromCart('product-123-340g-wholebean')

      expect(cartAfter.lineItems).toHaveLength(0)
      expect(cartAfter.subtotal).toBe(0)
      expect(cartAfter.total).toBe(0)
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity and recalculates lineTotal', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)
      const cart = cartService.updateQuantity('product-123-340g-wholebean', 5)

      expect(cart.lineItems[0]?.quantity).toBe(5)
      expect(cart.lineItems[0]?.lineTotal).toBe(9475) // 5 * 1895
      expect(cart.subtotal).toBe(9475)
    })

    it('throws for quantity < 1', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)

      expect(() => cartService.updateQuantity('product-123-340g-wholebean', 0)).toThrow(
        'Quantity must be at least 1',
      )
    })
  })

  describe('clearCart', () => {
    it('resets to empty cart', async () => {
      await cartService.addToCart(mockPurchaseSelection, 2)
      const cart = cartService.clearCart()

      expect(cart.lineItems).toHaveLength(0)
      expect(cart.subtotal).toBe(0)
      expect(cart.discount).toBe(0)
      expect(cart.total).toBe(0)
      expect(cart.appliedPromotion).toBeNull()
    })
  })
})
