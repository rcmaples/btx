'use client'

import {useEffect, useMemo, useState} from 'react'

import {productService} from '@/lib/services/product/product-service'
import type {FilterOptions, Product, ProductFilters} from '@/lib/types'

export function useProducts(filters?: ProductFilters, isMember?: boolean) {
  const [data, setData] = useState<Product[] | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Serialize filters for stable dependency tracking
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    productService
      .getProductsClient(filters, isMember)
      .then((products) => {
        if (!cancelled) setData(products)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, isMember])

  return {data, isLoading, error}
}

export function useProductBySlug(slug: string) {
  const [data, setData] = useState<Product | null | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!slug) {
      setData(undefined)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    productService
      .getProductBySlugClient(slug)
      .then((product) => {
        if (!cancelled) setData(product)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return {data, isLoading, error}
}

export function useFilterOptions() {
  const [data, setData] = useState<FilterOptions | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    productService
      .getFilterOptionsClient()
      .then((options) => {
        if (!cancelled) setData(options)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return {data, isLoading, error}
}
