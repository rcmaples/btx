'use client'

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
      className={`flex flex-col gap-md p-md border-b border-border md:flex-row md:justify-between md:items-center ${
        isSubscription ? 'bg-background-alt border-l-4 border-l-primary' : ''
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-sm mb-xs flex-wrap">
          <h3 className="text-lg font-semibold text-text">{item.productName}</h3>
          {isSubscription && (
            <span className="inline-block px-sm py-xs bg-primary text-background text-xs font-bold uppercase tracking-wider">
              Subscription
            </span>
          )}
          {isBundle && (
            <span className="inline-block px-sm py-xs bg-success text-background text-xs font-bold uppercase tracking-wider">
              Bundle
            </span>
          )}
        </div>
        <div className="flex items-center gap-sm text-sm text-text-secondary">
          <span>{item.sizeName}</span>
          <span className="text-text-tertiary">•</span>
          <span>{item.grind}</span>
        </div>
        {isSubscription && item.subscriptionDetails && (
          <div className="flex flex-col gap-xs mt-sm p-sm bg-background border border-border-light">
            <span className="text-sm font-semibold text-primary">
              {getCadenceLabel(item.subscriptionDetails.cadence)}
            </span>
            <span className="text-xs text-text-secondary font-mono">
              Recurring: ${(item.subscriptionDetails.recurringPrice / 100).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-md items-start md:flex-row md:items-center md:gap-lg">
        {!isSubscription && (
          <div className="flex items-center gap-sm">
            <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
              Qty:
            </label>
            <select
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

        <div className="flex flex-col gap-xs min-w-[120px] text-right">
          <div className="text-sm text-text-secondary">
            ${formattedPrice} {isSubscription ? 'per delivery' : 'each'}
          </div>
          <div className="text-lg font-semibold font-mono">${formattedLineTotal}</div>
        </div>

        <button
          onClick={handleRemove}
          className="px-md py-sm border border-border bg-transparent cursor-pointer text-sm font-medium transition-all duration-fast hover:bg-danger hover:border-danger hover:text-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Remove ${item.productName} from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
