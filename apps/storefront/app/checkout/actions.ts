'use server'

import {auth} from '@clerk/nextjs/server'

import {Prisma} from '@/generated/prisma/client'
import {getProfile, prisma} from '@/lib/prisma'
import type {CheckoutResult, CreateOrderRequest} from '@/lib/types/checkout'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BT-${timestamp}-${random}`
}

/**
 * Calculate shipping cost for the current user
 * Exchange members get free shipping
 */
export async function calculateShipping(): Promise<number> {
  const {userId} = await auth()

  if (userId) {
    const profile = await getProfile(userId)
    if (profile?.isExchangeMember) {
      return 0 // Free shipping for Exchange members
    }
  }

  return 500 // $5 flat rate
}

/**
 * Create an order in Prisma
 */
export async function createOrder(request: CreateOrderRequest): Promise<CheckoutResult> {
  try {
    const {shippingAddress} = request.formData

    // Validate name fields
    if (!shippingAddress.firstName) {
      return {success: false, error: 'First name is required'}
    }
    if (!shippingAddress.lastName) {
      return {success: false, error: 'Last name is required'}
    }

    // Validate address fields
    if (!shippingAddress.streetAddress) {
      return {success: false, error: 'Street address is required'}
    }
    if (!shippingAddress.city) {
      return {success: false, error: 'City is required'}
    }
    if (!shippingAddress.state) {
      return {success: false, error: 'State is required'}
    }
    if (!shippingAddress.postalCode) {
      return {success: false, error: 'Postal code is required'}
    }
    if (!shippingAddress.country) {
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

    // Get profile ID if authenticated
    let profileId: string | null = null
    if (request.userId) {
      const profile = await getProfile(request.userId)
      profileId = profile?.id ?? null
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Calculate totals
    const subtotal = request.cart.subtotal
    const discount = request.cart.discount
    const total = subtotal - discount + request.shippingCost

    // Create order in Prisma
    const order = await prisma.order.create({
      data: {
        orderNumber,
        profileId,
        guestEmail: request.formData.guestEmail || null,

        // Shipping address
        shippingFirstName: shippingAddress.firstName,
        shippingLastName: shippingAddress.lastName,
        shippingStreet: shippingAddress.streetAddress,
        shippingStreet2: shippingAddress.streetAddress2 || null,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,

        // Order contents (serialize for Prisma JSON field)
        lineItems: JSON.parse(JSON.stringify(request.cart.lineItems)),

        // Pricing
        subtotal,
        discount,
        shippingCost: request.shippingCost,
        total,

        // Promotion (use Prisma.JsonNull for nullable JSON fields)
        appliedPromotion: request.cart.appliedPromotion
          ? {
              code: request.cart.appliedPromotion.code,
              name: request.cart.appliedPromotion.name,
              discountType: request.cart.appliedPromotion.discountType,
              discountValue: request.cart.appliedPromotion.discountValue,
            }
          : Prisma.JsonNull,

        // Status
        status: 'PENDING',
        isTestOrder: process.env.NODE_ENV !== 'production',
      },
    })

    console.log('Order created:', {
      orderNumber: order.orderNumber,
      orderId: order.id,
      profileId: order.profileId,
      guestEmail: order.guestEmail,
      itemCount: request.cart.lineItems.length,
      total: order.total,
    })

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    }
  } catch (error) {
    console.error('Unexpected error during checkout:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
