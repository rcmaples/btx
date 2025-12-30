'use client'

import {useRouter} from 'next/navigation'

import {CartLineItem} from '@/components/cart/CartLineItem'
import {CartSummary} from '@/components/cart/CartSummary'
import {EmptyCart} from '@/components/cart/EmptyCart'
import {PromoCodeInput} from '@/components/cart/PromoCodeInput'
import {usePageName} from '@/lib/fullstory/hooks'
import {centsToReal, trackCheckoutInitiated} from '@/lib/fullstory/utils'
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

  // Track page view
  usePageName('Shopping Cart')

  const handleCheckout = () => {
    // Track before navigation
    trackCheckoutInitiated({
      cart_value: centsToReal(cart.total),
      item_count: cart.lineItems.reduce((sum, item) => sum + item.quantity, 0),
      has_promotion: cart.appliedPromotion !== null,
      promotion_code: cart.appliedPromotion?.code,
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
    <div className="container mx-auto px-md py-xl">
      <h1 className="text-4xl font-black tracking-tighter mb-xl">Shopping Cart</h1>

      {error && (
        <div className="p-md bg-red-50 border border-error text-error mb-lg" role="alert">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-md">
          {cart.lineItems.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
          ))}

          {/* Promo Code Section */}
          <div className="mt-lg pt-lg border-t-2 border-border">
            <PromoCodeInput
              onApply={async (code) => {
                await applyPromoCode(code)
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
              onRemovePromotion={removePromotion}
              showCheckoutButton={true}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
