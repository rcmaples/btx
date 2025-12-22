import type {Cart, CartLineItem, CartService, Promotion, PurchaseSelection} from '@/lib/types'
import {generateCartItemId} from '@/lib/types'
import {InvalidPromoCodeError, PromoMinimumNotMetError} from '@/lib/types'

import {getAutoPromotions, getPromotionByCode} from '../sanity/queries'
import {
  addOrUpdateLineItem,
  calculateCartTotals,
  clearCartFromStorage,
  loadCartFromStorage,
  removeLineItem,
  saveCartToStorage,
  updateLineItemQuantity,
} from './storage'

class CartServiceImpl implements CartService {
  private cart: Cart | null = null

  getCart(): Cart {
    if (!this.cart) {
      this.cart = loadCartFromStorage()
    }
    return this.cart
  }

  async addToCart(selection: PurchaseSelection, quantity: number = 1): Promise<Cart> {
    const cart = this.getCart()

    // Generate deterministic ID for deduplication
    const itemId = generateCartItemId(selection.productId, selection.sizeKey, selection.grind)

    // Create line item from selection data (no Sanity fetch needed)
    const lineItem: CartLineItem = {
      id: itemId,
      productId: selection.productId,
      productName: selection.productName,
      sizeKey: selection.sizeKey,
      sizeName: selection.sizeName,
      grams: selection.grams,
      grind: selection.grind,
      quantity,
      pricePerUnit: selection.priceInCents,
      lineTotal: quantity * selection.priceInCents,
    }

    // Add or update line item
    const updatedLineItems = addOrUpdateLineItem(cart.lineItems, lineItem)

    // Recalculate totals
    const {subtotal, total} = calculateCartTotals(updatedLineItems, cart.discount)

    const updatedCart: Cart = {
      ...cart,
      lineItems: updatedLineItems,
      subtotal,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    // Check for auto-apply promotions
    return this.checkAutoPromotions()
  }

  async addBundleToCart(bundle: {
    _id: string
    name: string
    price: number
    grind?: string
    products: Array<{_id: string; name: string}>
  }): Promise<Cart> {
    const cart = this.getCart()

    const grind = bundle.grind || 'Whole bean'
    const normalizedGrind = grind.toLowerCase().replace(/\s+/g, '')

    // Create bundle line item using bundle ID (include grind to allow same bundle with different grinds)
    const lineItem: CartLineItem = {
      id: `bundle-${bundle._id}-${normalizedGrind}`,
      productId: bundle._id,
      productName: bundle.name,
      sizeKey: 'bundle',
      sizeName: 'Bundle',
      grams: 0, // Not applicable for bundles
      grind: grind,
      quantity: 1,
      pricePerUnit: bundle.price,
      lineTotal: bundle.price,
      itemType: 'bundle' as const,
      bundleDetails: {
        bundleId: bundle._id,
        bundleName: bundle.name,
        products: bundle.products.map((p) => ({
          productId: p._id,
          priceInCents: 0, // Bundle has combined price, individual prices not tracked
          quantity: 1,
        })),
      },
    }

    // Check if bundle already in cart, increment quantity
    const existingIndex = cart.lineItems.findIndex((item) => item.id === lineItem.id)

    let updatedLineItems
    if (existingIndex >= 0) {
      updatedLineItems = cart.lineItems.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + 1,
              lineTotal: (item.quantity + 1) * item.pricePerUnit,
            }
          : item,
      )
    } else {
      updatedLineItems = [...cart.lineItems, lineItem]
    }

    // Recalculate totals
    const {subtotal, total} = calculateCartTotals(updatedLineItems, cart.discount)

    const updatedCart: Cart = {
      ...cart,
      lineItems: updatedLineItems,
      subtotal,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    // Check for auto-apply promotions
    return this.checkAutoPromotions()
  }

  removeFromCart(itemId: string): Cart {
    const cart = this.getCart()
    const updatedLineItems = removeLineItem(cart.lineItems, itemId)

    // Recalculate totals
    const {subtotal, total} = calculateCartTotals(updatedLineItems, cart.discount)

    const updatedCart: Cart = {
      ...cart,
      lineItems: updatedLineItems,
      subtotal,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    return updatedCart
  }

  updateQuantity(itemId: string, quantity: number): Cart {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1')
    }

    const cart = this.getCart()
    const updatedLineItems = updateLineItemQuantity(cart.lineItems, itemId, quantity)

    // Recalculate totals
    const {subtotal, total} = calculateCartTotals(updatedLineItems, cart.discount)

    const updatedCart: Cart = {
      ...cart,
      lineItems: updatedLineItems,
      subtotal,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    return updatedCart
  }

  clearCart(): Cart {
    clearCartFromStorage()
    const emptyCart = loadCartFromStorage()
    this.cart = emptyCart
    return emptyCart
  }

  async applyPromoCode(code: string): Promise<Cart> {
    const cart = this.getCart()

    // Fetch promotion
    const promotion = await getPromotionByCode(code)

    if (!promotion) {
      throw new InvalidPromoCodeError(code)
    }

    // Check if promotion is valid
    if (promotion.validUntil && new Date() > new Date(promotion.validUntil)) {
      throw new InvalidPromoCodeError(code)
    }

    // Check minimum purchase requirement
    if (promotion.minSubtotalCents && cart.subtotal < promotion.minSubtotalCents) {
      throw new PromoMinimumNotMetError(promotion.minSubtotalCents)
    }

    // Calculate discount
    let discount = 0
    if (promotion.discountType === 'percentage') {
      discount = Math.floor(cart.subtotal * (promotion.discountValue / 100))
    } else if (promotion.discountType === 'fixed_amount') {
      discount = Math.min(promotion.discountValue, cart.subtotal)
    }

    const {total} = calculateCartTotals(cart.lineItems, discount)

    const updatedCart: Cart = {
      ...cart,
      appliedPromotion: promotion,
      discount,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    return updatedCart
  }

  removePromotion(): Cart {
    const cart = this.getCart()

    const {total} = calculateCartTotals(cart.lineItems, 0)

    const updatedCart: Cart = {
      ...cart,
      appliedPromotion: null,
      discount: 0,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    return updatedCart
  }

  async checkAutoPromotions(): Promise<Cart> {
    const cart = this.getCart()

    // Don't override manual promo codes
    if (cart.appliedPromotion?.type === 'manual') {
      return cart
    }

    // Fetch auto promotions
    const promotions = await getAutoPromotions()

    // Find best matching promotion (highest minimum that cart qualifies for)
    let bestPromotion: Promotion | null = null
    for (const promo of promotions) {
      if (!promo.minSubtotalCents || cart.subtotal >= promo.minSubtotalCents) {
        if (!promo.validUntil || new Date() <= new Date(promo.validUntil)) {
          bestPromotion = promo
          break // Promotions are ordered by minimum purchase desc
        }
      }
    }

    if (!bestPromotion) {
      // Remove any existing auto promotion if cart no longer qualifies
      if (cart.appliedPromotion?.type === 'auto') {
        return this.removePromotion()
      }
      return cart
    }

    // Calculate discount
    let discount = 0
    if (bestPromotion.discountType === 'percentage') {
      discount = Math.floor(cart.subtotal * (bestPromotion.discountValue / 100))
    } else if (bestPromotion.discountType === 'fixed_amount') {
      discount = Math.min(bestPromotion.discountValue, cart.subtotal)
    }

    const {total} = calculateCartTotals(cart.lineItems, discount)

    const updatedCart: Cart = {
      ...cart,
      appliedPromotion: bestPromotion,
      discount,
      total,
      updatedAt: new Date(),
    }

    this.persistCart(updatedCart)
    this.cart = updatedCart

    return updatedCart
  }

  persistCart(cart: Cart): void {
    saveCartToStorage(cart)
  }

  async validateInventory(): Promise<string[]> {
    // All purchase options are considered in stock for MVP
    // Inventory validation will be implemented with Supabase integration
    return []
  }
}

export const cartService = new CartServiceImpl()
