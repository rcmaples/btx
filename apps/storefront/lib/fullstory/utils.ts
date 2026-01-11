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
  entry_point: string
  // cart_value, item_count, has_promotion, promotion_code are now page-level context
}

export interface ThemeToggleEvent {
  previous_theme: string
  new_theme: string
  resolved_theme: string
}

export interface ProductViewedEvent {
  product_id: string
  product_name: string
  // Extended properties are now at page level (proper data scoping)
  // They're available for queries via page context, not duplicated in event
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
  // item_count, has_promotion, promotion_code are now page-level context
}

export interface CheckoutFormSubmittedEvent {
  checkout_step: string // e.g., 'order_placement'
  has_guest_email: boolean
  shipping_country: string
}

// CartViewedEvent - no properties needed, cart context is at page level
export type CartViewedEvent = Record<string, never>

export interface ProductsFilteredEvent {
  filter_type: string
  filter_value: string
  results_count: number
}

export interface PromoCodeAppliedEvent {
  promo_code: string
  discount_amount: number
  discount_type: 'percentage' | 'fixed'
  cart_value_before: number
  cart_value_after: number
}

export interface PromoCodeFailedEvent {
  promo_code: string
  error_type: 'invalid' | 'expired' | 'minimum_not_met' | 'already_applied'
}

export interface PromoCodeRemovedEvent {
  promo_code: string
}

export interface MembershipEnrollClickedEvent {
  is_logged_in: boolean
  has_profile: boolean
  redirect_reason?: 'login_required' | 'profile_required' | null
}

// Helper to convert cents to dollars for  fields
export function centsToReal(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

// Log levels for FullStory logging (matches FullStory PublicLogLevel)
export type LogLevel = 'log' | 'warn' | 'error' | 'debug'

// FullStory logging utility - logs to FullStory session for debugging
export function fsLog(
  level: LogLevel,
  message: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || !FS) return

  try {
    // FS log API expects { level, msg } - we combine message and properties into msg
    const msg = properties ? {message, ...properties} : message
    FS('log', {level, msg})
  } catch (error) {
    console.warn('FullStory log error:', error)
  }
}

// Safe tracking wrapper
function safeTrackEvent(
  eventName: string,
  properties?:
    | AddToCartEvent
    | CheckoutInitiatedEvent
    | ThemeToggleEvent
    | ProductViewedEvent
    | ProductRemovedEvent
    | OrderCompletedEvent
    | CheckoutFormSubmittedEvent
    | CartViewedEvent
    | ProductsFilteredEvent
    | PromoCodeAppliedEvent
    | PromoCodeFailedEvent
    | PromoCodeRemovedEvent
    | MembershipEnrollClickedEvent,
): void {
  if (typeof window !== 'undefined' && FS) {
    try {
      FS('trackEvent', {
        name: eventName,
        properties:
          properties && Object.keys(properties).length > 0
            ? (properties as unknown as Record<string, unknown>)
            : {},
      })
    } catch (error) {
      fsLog('error', 'FullStory tracking error', {
        eventName,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
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

export function trackCheckoutFormSubmitted(params: CheckoutFormSubmittedEvent): void {
  safeTrackEvent('Checkout Form Submitted', params)
}

export function trackCartViewed(): void {
  safeTrackEvent('Cart Viewed')
}

export function trackProductsFiltered(params: ProductsFilteredEvent): void {
  safeTrackEvent('Products Filtered', params)
}

// Promo code event tracking functions
export function trackPromoCodeApplied(params: PromoCodeAppliedEvent): void {
  safeTrackEvent('Promo Code Applied', params)
}

export function trackPromoCodeFailed(params: PromoCodeFailedEvent): void {
  safeTrackEvent('Promo Code Failed', params)
}

export function trackPromoCodeRemoved(params: PromoCodeRemovedEvent): void {
  safeTrackEvent('Promo Code Removed', params)
}

// Membership funnel event tracking functions
export function trackMembershipPageViewed(): void {
  safeTrackEvent('Membership Page Viewed')
}

export function trackMembershipEnrollClicked(params: MembershipEnrollClickedEvent): void {
  safeTrackEvent('Membership Enroll Clicked', params)
}

export function trackMembershipEnrolled(): void {
  safeTrackEvent('Membership Enrolled')
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
