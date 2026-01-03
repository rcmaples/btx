import {describe, expect, it} from 'vitest'

import {
  addOrUpdateLineItem,
  calculateCartTotals,
  removeLineItem,
  updateLineItemQuantity,
} from '@/lib/services/cart/storage'

import {mockLineItem, mockLineItem2} from '../fixtures'

describe('calculateCartTotals', () => {
  it('calculates subtotal from line items', () => {
    const lineItems = [mockLineItem, mockLineItem2]
    const {subtotal, total} = calculateCartTotals(lineItems, 0)

    expect(subtotal).toBe(1895 + 4990) // mockLineItem + mockLineItem2
    expect(total).toBe(subtotal)
  })

  it('applies discount correctly', () => {
    const lineItems = [mockLineItem] // 1895 cents
    const discount = 500 // $5.00

    const {subtotal, total} = calculateCartTotals(lineItems, discount)

    expect(subtotal).toBe(1895)
    expect(total).toBe(1895 - 500)
  })

  it('total cannot go below zero', () => {
    const lineItems = [mockLineItem] // 1895 cents
    const discount = 5000 // $50.00 - more than subtotal

    const {subtotal, total} = calculateCartTotals(lineItems, discount)

    expect(subtotal).toBe(1895)
    expect(total).toBe(0) // Clamped to 0
  })
})

describe('addOrUpdateLineItem', () => {
  it('adds new item to empty cart', () => {
    const result = addOrUpdateLineItem([], mockLineItem)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(mockLineItem)
  })

  it('increments quantity for existing item ID', () => {
    const existingItems = [{...mockLineItem, quantity: 2, lineTotal: 3790}]
    const newItem = {...mockLineItem, quantity: 1, lineTotal: 1895}

    const result = addOrUpdateLineItem(existingItems, newItem)

    expect(result).toHaveLength(1)
    expect(result[0]?.quantity).toBe(3) // 2 + 1
    expect(result[0]?.lineTotal).toBe(5685) // 3 * 1895
  })
})

describe('removeLineItem', () => {
  it('removes item by ID', () => {
    const lineItems = [mockLineItem, mockLineItem2]

    const result = removeLineItem(lineItems, mockLineItem.id)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(mockLineItem2.id)
  })
})

describe('updateLineItemQuantity', () => {
  it('updates quantity and recalculates lineTotal', () => {
    const lineItems = [mockLineItem] // pricePerUnit: 1895

    const result = updateLineItemQuantity(lineItems, mockLineItem.id, 3)

    expect(result[0]?.quantity).toBe(3)
    expect(result[0]?.lineTotal).toBe(3 * 1895)
  })

  it('throws for quantity < 1', () => {
    const lineItems = [mockLineItem]

    expect(() => updateLineItemQuantity(lineItems, mockLineItem.id, 0)).toThrow(
      'Quantity must be at least 1',
    )
  })
})
