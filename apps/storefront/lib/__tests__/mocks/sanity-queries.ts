import {vi} from 'vitest'

import type {Promotion} from '@/lib/types'

/**
 * Mock implementations for Sanity query functions
 */
export const mockGetPromotionByCode = vi.fn<(code: string) => Promise<Promotion | null>>()
export const mockGetAutoPromotions = vi.fn<() => Promise<Promotion[]>>()

/**
 * Setup function to install mocks - call in beforeAll or at module level
 */
export function setupSanityMocks() {
  vi.mock('@/lib/services/sanity/queries', () => ({
    getPromotionByCode: mockGetPromotionByCode,
    getAutoPromotions: mockGetAutoPromotions,
  }))
}

/**
 * Reset mocks to default state - call in beforeEach
 */
export function resetSanityMocks() {
  mockGetPromotionByCode.mockReset()
  mockGetAutoPromotions.mockReset()
  // Default: no promotions found
  mockGetPromotionByCode.mockResolvedValue(null)
  mockGetAutoPromotions.mockResolvedValue([])
}
