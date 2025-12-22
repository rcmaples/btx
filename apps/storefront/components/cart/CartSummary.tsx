'use client'

import {useEffect, useRef} from 'react'

import type {Cart} from '@/lib/types'

interface CartSummaryProps {
  cart: Cart
  onRemovePromotion?: () => void
  showCheckoutButton?: boolean
  onCheckout?: () => void
}

export function CartSummary({
  cart,
  onRemovePromotion,
  showCheckoutButton = false,
  onCheckout,
}: CartSummaryProps) {
  const formattedSubtotal = (cart.subtotal / 100).toFixed(2)
  const formattedDiscount = (cart.discount / 100).toFixed(2)
  const formattedTotal = (cart.total / 100).toFixed(2)

  const hasPromotion = cart.appliedPromotion !== null
  const previousTotal = useRef(cart.total)
  const announcementRef = useRef<HTMLDivElement>(null)

  // Announce cart updates to screen readers
  useEffect(() => {
    if (previousTotal.current !== cart.total && announcementRef.current) {
      const message = `Cart updated. Total: $${formattedTotal}`
      announcementRef.current.textContent = message
    }
    previousTotal.current = cart.total
  }, [cart.total, formattedTotal])

  return (
    <div
      className="p-lg border-2 border-border bg-background-secondary"
      role="region"
      aria-label="Order summary"
    >
      {/* Screen reader announcements for cart updates */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <h2 className="text-xl font-bold mb-md pb-md border-b border-border">Order Summary</h2>

      <div className="flex justify-between items-center py-sm">
        <span className="text-base text-text-secondary">Subtotal</span>
        <span className="text-base font-medium font-mono">${formattedSubtotal}</span>
      </div>

      {hasPromotion && (
        <div className="flex justify-between items-start py-sm bg-success-light -mx-md px-md">
          <div className="flex flex-col gap-xs">
            <span className="text-base text-text-secondary">
              {cart.appliedPromotion?.name || 'Promotion'}
            </span>
            {cart.appliedPromotion?.code && (
              <span className="text-sm font-semibold font-mono text-success uppercase">
                {cart.appliedPromotion.code}
              </span>
            )}
            {onRemovePromotion && (
              <button
                onClick={onRemovePromotion}
                className="text-xs text-danger bg-transparent border-none p-0 cursor-pointer underline mt-xs hover:text-danger-dark"
                aria-label="Remove promotion"
              >
                Remove
              </button>
            )}
          </div>
          <span className="text-base font-semibold font-mono text-success">
            -${formattedDiscount}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center py-md mt-md border-t-2 border-border">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold font-mono">${formattedTotal}</span>
      </div>

      {showCheckoutButton && onCheckout && (
        <button
          onClick={onCheckout}
          disabled={cart.lineItems.length === 0}
          className="w-full py-md px-lg mt-lg bg-primary text-background border-2 border-primary text-base font-semibold cursor-pointer transition-all duration-fast hover:bg-primary-dark hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 disabled:bg-disabled disabled:border-disabled disabled:cursor-not-allowed disabled:opacity-60"
        >
          Proceed to Checkout
        </button>
      )}

      <p className="mt-md p-sm bg-warning-light border border-warning text-sm text-center text-text-secondary">
        Test mode: No real payment will be processed
      </p>
    </div>
  )
}
