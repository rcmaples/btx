'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useState} from 'react'

import {ProductCard} from '@/components/product/ProductCard'
import {ProductFilters} from '@/components/product/ProductFilters'
import {useMembership} from '@/lib/hooks/useMembership'
import {useProducts} from '@/lib/hooks/useProducts'
import type {ProductFilters as Filters} from '@/lib/types'

interface ProductsClientWrapperProps {
  initialFilters: Filters
}

export function ProductsClientWrapper({initialFilters}: ProductsClientWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {isMember, mounted} = useMembership()

  const [filters, setFilters] = useState<Filters>(initialFilters)

  // Use React Query - will use hydrated data from server on initial load
  const {data: products, isLoading, error} = useProducts(filters, mounted ? isMember : false)

  // products comes from hydrated cache on initial load - no re-fetch needed
  const displayProducts = products ?? []

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.roastLevel) params.set('roastLevel', filters.roastLevel)
    if (filters.origin) params.set('origin', filters.origin)
    if (filters.processMethod) params.set('processMethod', filters.processMethod)
    if (filters.bestFor) params.set('bestFor', filters.bestFor)
    if (filters.exclusiveOnly) params.set('exclusiveOnly', 'true')

    const newUrl = params.toString() ? `?${params.toString()}` : '/products'
    router.replace(newUrl, {scroll: false})
  }, [filters, router])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  return (
    <div>
      <header className="mb-xl">
        <h1 className="text-5xl font-black tracking-tighter mb-sm">Coffee</h1>
        <p className="text-lg text-text-muted">Browse our selection of premium coffee</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-xl">
        <aside>
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
            isMember={mounted && isMember}
          />
        </aside>

        <main>
          {isLoading && !products && (
            <div className="text-center py-xxl">
              <div className="text-text-muted mb-lg">Loading products...</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="aspect-square bg-background-alt animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-xxl">
              <h2 className="text-2xl font-bold mb-md">Failed to load products</h2>
              <p className="text-text-muted mb-lg">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-background px-lg py-sm border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && displayProducts.length === 0 && (
            <div className="text-center py-xxl">
              <h2 className="text-2xl font-bold mb-md">No products found</h2>
              <p className="text-text-muted mb-lg">
                Try adjusting your filters to see more results
              </p>
              <button
                onClick={() => setFilters({})}
                className="bg-primary text-background px-lg py-sm border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast"
              >
                Clear all filters
              </button>
            </div>
          )}

          {displayProducts.length > 0 && (
            <>
              <div className="mb-md">
                <p className="text-sm text-text-muted">
                  {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                {displayProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
