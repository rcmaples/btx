import {beforeEach, describe, expect, it, vi} from 'vitest'
import {InvalidPromoCodeError, PromoMinimumNotMetError} from '@/lib/types'
import {
  mockAutoPromo,
  mockExpiredPromo,
  mockFixedAmountPromo,
  mockMinimumPurchasePromo,
  mockPercentagePromo,
  mockPurchaseSelection,
} from '../fixtures'

// Create mock functions
const mockGetPromotionByCode = vi.fn()
const mockGetAutoPromotions = vi.fn()

// Mock Sanity queries before importing cart service
vi.mock('@/lib/services/sanity/queries', () => ({
  getPromotionByCode: mockGetPromotionByCode,
  getAutoPromotions: mockGetAutoPromotions,
}))

// Import after mocking
const {cartService} = await import('@/lib/services/cart/cart-service')

describe('CartService Promotions', () => {
  beforeEach(() => {
    // Reset mocks
    mockGetPromotionByCode.mockReset()
    mockGetAutoPromotions.mockReset()
    mockGetAutoPromotions.mockResolvedValue([])

    // Clear cart before each test
    cartService.clearCart()
  })

  describe('applyPromoCode', () => {
    it('applies percentage discount correctly', async () => {
      // Add item worth $18.95
      await cartService.addToCart(mockPurchaseSelection, 1)
      mockGetPromotionByCode.mockResolvedValue(mockPercentagePromo) // 10% off

      const cart = await cartService.applyPromoCode('SAVE10')

      // 10% of 1895 = 189.5, floored to 189
      expect(cart.discount).toBe(189)
      expect(cart.total).toBe(1895 - 189)
      expect(cart.appliedPromotion?.code).toBe('SAVE10')
    })

    it('applies fixed amount discount correctly', async () => {
      // Add item worth $18.95
      await cartService.addToCart(mockPurchaseSelection, 1)
      mockGetPromotionByCode.mockResolvedValue(mockFixedAmountPromo) // $5 off

      const cart = await cartService.applyPromoCode('FLAT5')

      expect(cart.discount).toBe(500)
      expect(cart.total).toBe(1895 - 500)
      expect(cart.appliedPromotion?.code).toBe('FLAT5')
    })

    it('throws InvalidPromoCodeError for invalid code', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)
      mockGetPromotionByCode.mockResolvedValue(null)

      await expect(cartService.applyPromoCode('INVALID')).rejects.toThrow(InvalidPromoCodeError)
    })

    it('throws PromoMinimumNotMetError when subtotal too low', async () => {
      // Add item worth $18.95 (below $30 minimum)
      await cartService.addToCart(mockPurchaseSelection, 1)
      mockGetPromotionByCode.mockResolvedValue(mockMinimumPurchasePromo) // $30 minimum

      await expect(cartService.applyPromoCode('MIN30')).rejects.toThrow(PromoMinimumNotMetError)
    })

    it('throws InvalidPromoCodeError for expired promo', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)
      mockGetPromotionByCode.mockResolvedValue(mockExpiredPromo)

      await expect(cartService.applyPromoCode('EXPIRED')).rejects.toThrow(InvalidPromoCodeError)
    })
  })

  describe('removePromotion', () => {
    it('clears promotion and recalculates total', async () => {
      await cartService.addToCart(mockPurchaseSelection, 1)
      mockGetPromotionByCode.mockResolvedValue(mockPercentagePromo)
      await cartService.applyPromoCode('SAVE10')

      const cart = cartService.removePromotion()

      expect(cart.discount).toBe(0)
      expect(cart.total).toBe(1895)
      expect(cart.appliedPromotion).toBeNull()
    })
  })

  describe('checkAutoPromotions', () => {
    it('applies best matching auto promo', async () => {
      // Add items to exceed $50 minimum
      await cartService.addToCart(mockPurchaseSelection, 3) // 3 * $18.95 = $56.85
      mockGetAutoPromotions.mockResolvedValue([mockAutoPromo]) // $5 off on $50+

      const cart = await cartService.checkAutoPromotions()

      expect(cart.appliedPromotion?.type).toBe('auto')
      expect(cart.discount).toBe(500)
    })

    it('preserves manual promo over auto promo', async () => {
      // Add items and apply manual promo
      await cartService.addToCart(mockPurchaseSelection, 3)
      mockGetPromotionByCode.mockResolvedValue(mockPercentagePromo)
      await cartService.applyPromoCode('SAVE10')

      // Try to apply auto promo
      mockGetAutoPromotions.mockResolvedValue([mockAutoPromo])
      const cart = await cartService.checkAutoPromotions()

      // Manual promo should be preserved
      expect(cart.appliedPromotion?.type).toBe('manual')
      expect(cart.appliedPromotion?.code).toBe('SAVE10')
    })
  })
})
