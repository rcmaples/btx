import {FullStory as FS} from '@fullstory/browser'

// Type definitions
export interface AddToCartEvent {
  product_sku_str: string
  product_name_str: string
  quantity_int: number
  price_real: number
  size_str: string
  grind_str: string
}

export interface CheckoutInitiatedEvent {
  cart_value_real: number
  item_count_int: number
  has_promotion_bool: boolean
  promotion_code_str?: string
}

// Helper to convert cents to dollars for _real fields
export function centsToReal(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

// Safe tracking wrapper
function safeTrackEvent(
  eventName: string,
  properties: AddToCartEvent | CheckoutInitiatedEvent,
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
