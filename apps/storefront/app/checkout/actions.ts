'use server';

import { createClient } from '@/lib/supabase/server';
import type { CreateOrderRequest, CheckoutResult } from '@/lib/types/checkout';

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BT-${timestamp}-${random}`;
}

export async function calculateShipping(userId?: string): Promise<number> {
  // Return 0 if Exchange member, 500 cents otherwise
  if (!userId) return 500;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_exchange_member')
    .eq('id', userId)
    .single();

  return profile?.is_exchange_member ? 0 : 500;
}

export async function createOrder(
  request: CreateOrderRequest
): Promise<CheckoutResult> {
  try {
    // 1. Get authenticated user (if any)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Validate inputs
    if (!request.formData.shippingAddress.streetAddress) {
      return { success: false, error: 'Street address is required' };
    }
    if (!request.formData.shippingAddress.city) {
      return { success: false, error: 'City is required' };
    }
    if (!request.formData.shippingAddress.state) {
      return { success: false, error: 'State is required' };
    }
    if (!request.formData.shippingAddress.postalCode) {
      return { success: false, error: 'Postal code is required' };
    }
    if (!request.formData.shippingAddress.country) {
      return { success: false, error: 'Country is required' };
    }

    // Guest checkout validation
    if (!user && !request.formData.guestEmail) {
      return { success: false, error: 'Email is required for guest checkout' };
    }

    // Email format validation
    if (request.formData.guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.formData.guestEmail)) {
        return { success: false, error: 'Invalid email format' };
      }
    }

    // Validate cart is not empty
    if (!request.cart.lineItems || request.cart.lineItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // 3. Generate order number
    const orderNumber = generateOrderNumber();

    // 4. Prepare line items JSONB
    const lineItems = request.cart.lineItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sizeKey: item.sizeKey,
      sizeName: item.sizeName,
      grams: item.grams,
      grind: item.grind,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      lineTotal: item.lineTotal,
      itemType: item.itemType || 'product',
      bundleDetails: item.bundleDetails,
    }));

    // 5. Insert order into Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_email: request.formData.guestEmail || null,
        shipping_street_address: request.formData.shippingAddress.streetAddress,
        shipping_street_address_2:
          request.formData.shippingAddress.streetAddress2 || null,
        shipping_city: request.formData.shippingAddress.city,
        shipping_state: request.formData.shippingAddress.state,
        shipping_postal_code: request.formData.shippingAddress.postalCode,
        shipping_country: request.formData.shippingAddress.country,
        line_items: lineItems,
        subtotal: request.cart.subtotal,
        discount: request.cart.discount,
        shipping_cost: request.shippingCost,
        total: request.cart.total + request.shippingCost,
        applied_promotion: request.cart.appliedPromotion,
        status: 'completed',
        is_test_order: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    };
  } catch (error) {
    console.error('Unexpected error during checkout:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
