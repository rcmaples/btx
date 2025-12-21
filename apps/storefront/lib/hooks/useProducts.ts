'use client'

import {useQuery} from '@tanstack/react-query'
import {productService} from '@/lib/services/product/product-service'
import type {FilterOptions, Product, ProductFilters} from '@/lib/types'

// Query key factory for stable keys
const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters, isMember?: boolean) =>
    [...productKeys.lists(), {filters, isMember}] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  filterOptions: () => [...productKeys.all, 'filterOptions'] as const,
}

export function useProducts(filters?: ProductFilters, isMember?: boolean) {
  return useQuery({
    queryKey: productKeys.list(filters, isMember),
    queryFn: () => productService.getProductsClient(filters, isMember),
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productService.getProductBySlugClient(slug),
    enabled: !!slug,
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: productKeys.filterOptions(),
    queryFn: () => productService.getFilterOptionsClient(),
    staleTime: 10 * 60 * 1000, // Filter options change rarely
  })
}
