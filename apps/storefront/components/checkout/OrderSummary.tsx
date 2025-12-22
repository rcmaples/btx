'use client'

import {centsToReal} from '@/lib/fullstory/utils'
import type {Cart} from '@/lib/types'

interface OrderSummaryProps {
  cart: Cart
  shippingCost: number
  isMember: boolean
}

export function OrderSummary({cart, shippingCost, isMember}: OrderSummaryProps) {
  const formattedSubtotal = (cart.subtotal / 100).toFixed(2)
  const formattedDiscount = (cart.discount / 100).toFixed(2)
  const formattedShipping = (shippingCost / 100).toFixed(2)
  const total = cart.total + shippingCost
  const formattedTotal = (total / 100).toFixed(2)

  const hasPromotion = cart.appliedPromotion !== null

  return (
    <div
      className="p-lg border-2 border-border bg-background-secondary"
      role="region"
      aria-label="Order summary"
      data-fs-element="checkout-order-summary"
      data-fs-total-amount-real={centsToReal(total)}
      data-fs-item-count-int={cart.lineItems.reduce((sum, item) => sum + item.quantity, 0)}
      data-fs-has-promotion-bool={hasPromotion}
      data-fs-discount-amount-real={centsToReal(cart.discount)}
    >
      <h2 className="text-xl font-bold mb-md pb-md border-b border-border">Order Summary</h2>

      {/* Line Items */}
      <div className="space-y-sm mb-md pb-md border-b border-border">
        {cart.lineItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-text-secondary">
              {item.productName} ({item.quantity}x)
            </span>
            <span className="font-medium font-mono">${(item.lineTotal / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="flex justify-between items-center py-sm">
        <span className="text-base text-text-secondary">Subtotal</span>
        <span className="text-base font-medium font-mono">${formattedSubtotal}</span>
      </div>

      {/* Discount */}
      {hasPromotion && (
        <div className="flex justify-between items-start py-sm bg-success-light -mx-lg px-lg">
          <div className="flex flex-col gap-xs">
            <span className="text-base text-text-secondary">
              {cart.appliedPromotion?.name || 'Promotion'}
            </span>
            {cart.appliedPromotion?.code && (
              <span className="text-sm font-semibold font-mono text-success uppercase">
                {cart.appliedPromotion.code}
              </span>
            )}
          </div>
          <span className="text-base font-semibold font-mono text-success">
            -${formattedDiscount}
          </span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between items-center py-sm">
        <div className="flex flex-col gap-xs">
          <span className="text-base text-text-secondary">Shipping</span>
          {isMember && shippingCost === 0 && (
            <span className="text-xs text-success font-semibold">FREE for Exchange Members</span>
          )}
        </div>
        <span className="text-base font-medium font-mono">
          {shippingCost === 0 ? 'FREE' : `$${formattedShipping}`}
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-md mt-md border-t-2 border-border">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold font-mono">${formattedTotal}</span>
      </div>

      {/* Test Mode Warning */}
      <p className="mt-md p-sm bg-warning-light border border-warning text-sm text-center text-text-secondary">
        Test mode: No real payment will be processed
      </p>
    </div>
  )
}
