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

// Helper to convert cents to dollars for  fields
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
