'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useMemo} from 'react'

import {CartLineItem} from '@/components/cart/CartLineItem'
import {CartSummary} from '@/components/cart/CartSummary'
import {EmptyCart} from '@/components/cart/EmptyCart'
import {PromoCodeInput} from '@/components/cart/PromoCodeInput'
import {usePageProperties} from '@/lib/fullstory/hooks'
import {
  centsToReal,
  trackCartViewed,
  trackCheckoutInitiated,
  trackPromoCodeApplied,
  trackPromoCodeRemoved,
} from '@/lib/fullstory/utils'
import {useCart} from '@/lib/hooks/useCart'

export default function CartPage() {
  const router = useRouter()
  const {
    cart,
    mounted,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
    removePromotion,
    isLoading,
    error,
  } = useCart()

  // Set page-level cart context (proper data scoping)
  // Cart context is available for all analytics queries on this page view
  const pageProperties = useMemo(
    () => ({
      pageName: 'Shopping Cart',
      cartValue: centsToReal(cart.total),
      itemCount: cart.lineItems.reduce((sum, item) => sum + item.quantity, 0),
      hasPromotion: cart.appliedPromotion !== null,
      promotionCode: cart.appliedPromotion?.code,
    }),
    [cart],
  )
  usePageProperties(pageProperties)

  // Track Cart Viewed event (discrete action - cart context inherited from page)
  useEffect(() => {
    if (mounted && cart.lineItems.length > 0) {
      trackCartViewed()
    }
  }, [mounted, cart.lineItems.length])

  const handleCheckout = () => {
    // Track before navigation (cart context inherited from page)
    trackCheckoutInitiated({
      entry_point: 'cart_page',
    })

    router.push('/checkout')
  }

  // Show empty cart if no items (after mount to prevent hydration mismatch)
  if (mounted && cart.lineItems.length === 0) {
    return (
      <div className="container mx-auto px-md py-xl">
        <h1 className="text-4xl font-black tracking-tighter mb-xl">Shopping Cart</h1>
        <EmptyCart />
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-black tracking-tighter mb-md">Shopping Cart</h2>

      {error && (
        <div className="p-md bg-red-50 border border-error text-error mb-lg" role="alert">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-md border-border border-t-2 pt-sm">
          {cart.lineItems.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
          ))}

          {/* Promo Code Section */}
          <div className="mt-lg border-border">
            <PromoCodeInput
              onApply={async (code) => {
                const cartValueBefore = cart.total
                await applyPromoCode(code)
                // Track successful promo code application
                // Note: cart state will update after this, so we compute discount manually
                const discountAmount = cartValueBefore - (cart.total - cart.discount)
                trackPromoCodeApplied({
                  promo_code: code,
                  discount_amount: centsToReal(discountAmount > 0 ? discountAmount : cart.discount),
                  discount_type: 'fixed', // Default type since we don't have this info
                  cart_value_before: centsToReal(cartValueBefore),
                  cart_value_after: centsToReal(cart.total),
                })
              }}
              appliedPromotion={cart.appliedPromotion}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-md">
            <CartSummary
              cart={cart}
              onRemovePromotion={() => {
                const promoCode = cart.appliedPromotion?.code
                if (promoCode) {
                  trackPromoCodeRemoved({promo_code: promoCode})
                }
                removePromotion()
              }}
              showCheckoutButton={true}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
