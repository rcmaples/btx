import {describe, expect, it} from 'vitest'

import {generateCartItemId} from '@/lib/types'

describe('generateCartItemId', () => {
  it('generates deterministic ID from product, size, and grind', () => {
    const id1 = generateCartItemId('product-123', '340g', 'Whole Bean')
    const id2 = generateCartItemId('product-123', '340g', 'Whole Bean')

    expect(id1).toBe(id2)
    expect(id1).toBe('product-123-340g-wholebean')
  })

  it('normalizes grind to lowercase without spaces', () => {
    const id = generateCartItemId('product-123', '340g', 'Whole Bean')

    expect(id).toBe('product-123-340g-wholebean')
    expect(id).not.toContain(' ')
    expect(id).not.toMatch(/[A-Z]/)
  })

  it('handles different grind formats consistently', () => {
    const id1 = generateCartItemId('product-123', '340g', 'Drip Coffee')
    const id2 = generateCartItemId('product-123', '340g', 'drip coffee')
    const id3 = generateCartItemId('product-123', '340g', 'DripCoffee')

    expect(id1).toBe(id2)
    expect(id2).toBe(id3)
    expect(id1).toBe('product-123-340g-dripcoffee')
  })
})
