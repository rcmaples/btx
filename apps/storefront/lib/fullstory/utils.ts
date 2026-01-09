import {FullStory as FS} from '@fullstory/browser'

// Type definitions
export interface AddToCartEvent {
  product_sku: string
  product_name: string
  quantity: number
  price: number
  size: string
  grind: string
}

export interface CheckoutInitiatedEvent {
  cart_value: number
  item_count: number
  has_promotion: boolean
  promotion_code?: string
}

export interface ThemeToggleEvent {
  previous_theme: string
  new_theme: string
  resolved_theme: string
}

export interface ProductViewedEvent {
  product_id: string
  product_name: string
  roast_level: string
  origin: string
  product_type: string
  base_price: number
  flavor_profile: string
  process_method: string
  is_exclusive_drop: boolean
  best_for: string
}

export interface ProductRemovedEvent {
  product_id: string
  product_name: string
  quantity: number
  price: number
  size: string
  grind: string
}

export interface OrderCompletedEvent {
  order_id: string
  revenue: number
  shipping: number
  currency: string
  item_count: number
  has_promotion: boolean
  promotion_code?: string
}

export interface CartViewedEvent {
  cart_value: number
  item_count: number
  has_promotion: boolean
}

export interface ProductsFilteredEvent {
  filter_type: string
  filter_value: string
  results_count: number
}

// Helper to convert cents to dollars for  fields
export function centsToReal(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

// Safe tracking wrapper
function safeTrackEvent(
  eventName: string,
  properties:
    | AddToCartEvent
    | CheckoutInitiatedEvent
    | ThemeToggleEvent
    | ProductViewedEvent
    | ProductRemovedEvent
    | OrderCompletedEvent
    | CartViewedEvent
    | ProductsFilteredEvent,
): void {
  if (typeof window !== 'undefined' && FS) {
    try {
      FS('trackEvent', {
        name: eventName,
        properties: properties as unknown as Record<string, unknown>,
      })
    } catch (error) {
      console.warn('FullStory tracking error:', error)
    }
  }
}

// Event tracking functions
export function trackAddToCart(params: AddToCartEvent): void {
  safeTrackEvent('Add to Cart', params)
}

export function trackCheckoutInitiated(params: CheckoutInitiatedEvent): void {
  safeTrackEvent('Checkout Initiated', params)
}

export function trackThemeToggle(params: ThemeToggleEvent): void {
  safeTrackEvent('Theme Toggle', params)
}

export function trackProductViewed(params: ProductViewedEvent): void {
  safeTrackEvent('Product Viewed', params)
}

export function trackProductRemoved(params: ProductRemovedEvent): void {
  safeTrackEvent('Product Removed', params)
}

export function trackOrderCompleted(params: OrderCompletedEvent): void {
  safeTrackEvent('Order Completed', params)
}

export function trackCartViewed(params: CartViewedEvent): void {
  safeTrackEvent('Cart Viewed', params)
}

export function trackProductsFiltered(params: ProductsFilteredEvent): void {
  safeTrackEvent('Products Filtered', params)
}

// User identification functions
export function identifyUser(
  userId: string,
  email: string,
  displayName?: string,
  isExchangeMember?: boolean,
): void {
  if (typeof window === 'undefined' || !FS) return

  try {
    FS('setIdentity', {
      uid: userId,
      properties: {
        displayName: displayName || email,
        email: email,
        isExchangeMember: isExchangeMember ?? false,
      },
    })
  } catch (error) {
    console.warn('FullStory identify error:', error)
  }
}

export function anonymizeUser(): void {
  if (typeof window === 'undefined' || !FS) return

  try {
    FS('setIdentity', {anonymous: true})
  } catch (error) {
    console.warn('FullStory anonymize error:', error)
  }
}
