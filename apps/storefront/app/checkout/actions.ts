'use server'

import type {CheckoutResult, CreateOrderRequest} from '@/lib/types/checkout'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BT-${timestamp}-${random}`
}

// Stubbed during Supabase removal - will use Prisma in Phase 3
export async function calculateShipping(_userId?: string): Promise<number> {
  // Always return standard shipping during migration
  return 500
}

// Stubbed during Supabase removal - will use Prisma in Phase 3
export async function createOrder(request: CreateOrderRequest): Promise<CheckoutResult> {
  try {
    // Validate inputs
    if (!request.formData.shippingAddress.streetAddress) {
      return {success: false, error: 'Street address is required'}
    }
    if (!request.formData.shippingAddress.city) {
      return {success: false, error: 'City is required'}
    }
    if (!request.formData.shippingAddress.state) {
      return {success: false, error: 'State is required'}
    }
    if (!request.formData.shippingAddress.postalCode) {
      return {success: false, error: 'Postal code is required'}
    }
    if (!request.formData.shippingAddress.country) {
      return {success: false, error: 'Country is required'}
    }

    // Guest checkout validation
    if (!request.userId && !request.formData.guestEmail) {
      return {success: false, error: 'Email is required for guest checkout'}
    }

    // Email format validation
    if (request.formData.guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(request.formData.guestEmail)) {
        return {success: false, error: 'Invalid email format'}
      }
    }

    // Validate cart is not empty
    if (!request.cart.lineItems || request.cart.lineItems.length === 0) {
      return {success: false, error: 'Cart is empty'}
    }

    // Generate order number (order creation stubbed - will use Prisma in Phase 3)
    const orderNumber = generateOrderNumber()

    // For now, just return success with order number
    // Actual database insertion will be implemented in Phase 3
    console.log('Order created (stubbed):', {
      orderNumber,
      email: request.formData.guestEmail || 'authenticated user',
      itemCount: request.cart.lineItems.length,
      total: request.cart.total + request.shippingCost,
    })

    return {
      success: true,
      orderId: `stub-${orderNumber}`,
      orderNumber,
    }
  } catch (error) {
    console.error('Unexpected error during checkout:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
