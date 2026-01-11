'use client'

import {centsToReal, trackProductRemoved} from '@/lib/fullstory/utils'
import type {CartLineItem as CartLineItemType} from '@/lib/types'

interface CartLineItemProps {
  item: CartLineItemType
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartLineItem({item, onUpdateQuantity, onRemove}: CartLineItemProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value, 10)
    onUpdateQuantity(item.id, newQuantity)
  }

  const handleRemove = () => {
    trackProductRemoved({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: centsToReal(item.pricePerUnit),
      size: item.sizeName,
      grind: item.grind,
    })
    onRemove(item.id)
  }

  const formattedPrice = (item.pricePerUnit / 100).toFixed(2)
  const formattedLineTotal = (item.lineTotal / 100).toFixed(2)

  const isSubscription = item.itemType === 'subscription'
  const isBundle = item.itemType === 'bundle'

  const getCadenceLabel = (cadence: 'weekly' | 'bi-weekly' | 'monthly') => {
    switch (cadence) {
      case 'weekly':
        return 'Delivered Weekly'
      case 'bi-weekly':
        return 'Delivered Bi-Weekly'
      case 'monthly':
        return 'Delivered Monthly'
    }
  }

  return (
    <div
      className={`flex flex-col gap-sm p-md md:flex-row md:justify-between md:items-center md:gap-md ${
        isSubscription ? 'bg-background-alt border-l-4 border-l-primary' : ''
      }`}
      data-fs-element={`cart-item-${item.productId}`}
      data-fs-product-id-str={item.productId}
      data-fs-product-name-str={item.productName}
      data-fs-price-real={centsToReal(item.pricePerUnit)}
      data-fs-quantity-int={item.quantity}
      data-fs-item-type-str={item.itemType}
      data-fs-properties-schema={JSON.stringify({
        'data-fs-product-id-str': {type: 'str', name: 'productId'},
        'data-fs-product-name-str': {type: 'str', name: 'productName'},
        'data-fs-price-real': {type: 'real', name: 'price'},
        'data-fs-quantity-int': {type: 'int', name: 'quantity'},
        'data-fs-item-type-str': {type: 'str', name: 'itemType'},
      })}
    >
      {/* Product info row */}
      <div className="flex items-start justify-between gap-sm md:flex-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-sm flex-wrap">
            <h3 className="text-base font-semibold text-text">{item.productName}</h3>
            <span className="text-sm text-text-secondary whitespace-nowrap">
              {item.sizeName} • {item.grind}
            </span>
            {isSubscription && (
              <span className="inline-block px-sm py-xs bg-primary text-background text-xs font-bold uppercase tracking-wider">
                Sub
              </span>
            )}
            {isBundle && (
              <span className="inline-block px-sm py-xs bg-success text-background text-xs font-bold uppercase tracking-wider">
                Bundle
              </span>
            )}
          </div>
          {isSubscription && item.subscriptionDetails && (
            <div className="flex items-center gap-sm mt-xs text-sm">
              <span className="font-medium text-primary">
                {getCadenceLabel(item.subscriptionDetails.cadence)}
              </span>
              <span className="text-text-secondary font-mono">
                ${(item.subscriptionDetails.recurringPrice / 100).toFixed(2)}/delivery
              </span>
            </div>
          )}
        </div>

        {/* Trash icon - visible on mobile, hidden on desktop (shown at end on desktop) */}
        <button
          onClick={handleRemove}
          className="p-xs text-text-secondary hover:text-danger transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:hidden"
          aria-label={`Remove ${item.productName} from cart`}
          data-fs-element="cart-item-remove-button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-md md:gap-lg">
        {!isSubscription && (
          <div className="flex items-center gap-sm">
            <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
              Qty:
            </label>
            <select
              data-fs-element="cart-item-quantity"
              id={`quantity-${item.id}`}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="px-sm py-xs border border-border rounded-sm text-base bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {Array.from({length: 10}, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
        {isSubscription && (
          <div className="flex items-center gap-sm">
            <span className="text-sm font-medium">Qty: 1</span>
          </div>
        )}

        <div className="flex items-center gap-md">
          <div className="flex flex-col items-end">
            <div className="text-lg font-semibold font-mono">${formattedLineTotal}</div>
            <div className="text-xs text-text-secondary">
              ${formattedPrice} {isSubscription ? '/delivery' : 'ea'}
            </div>
          </div>

          {/* Trash icon - desktop only */}
          <button
            onClick={handleRemove}
            className="hidden md:block p-sm text-text-secondary hover:text-danger transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Remove ${item.productName} from cart`}
            data-fs-element="cart-item-remove-button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
