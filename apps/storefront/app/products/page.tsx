import {Metadata} from 'next'
import {getProducts, getFilterOptions} from '@/lib/services/sanity/queries'
import {ClientAuthWrapper} from '@/lib/providers/ClientAuthWrapper'
import {ProductsClientWrapper} from './ProductsClientWrapper'

export const metadata: Metadata = {
  title: 'Coffee',
  description: 'Browse our selection of premium specialty coffee.',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    roastLevel?: string
    origin?: string
    processMethod?: string
    bestFor?: string
    exclusiveOnly?: string
  }>
}) {
  const params = await searchParams

  // Fetch products and filter options server-side
  const [products, filterOptions] = await Promise.all([
    getProducts({
      roastLevel: params.roastLevel,
      origin: params.origin,
      processMethod: params.processMethod,
      bestFor: params.bestFor,
      exclusiveOnly: params.exclusiveOnly === 'true',
      isMember: false, // Client will re-fetch with membership status
    }),
    getFilterOptions(),
  ])

  return (
    <ClientAuthWrapper>
      <ProductsClientWrapper
        initialProducts={products}
        filterOptions={filterOptions}
        initialFilters={{
          roastLevel: params.roastLevel as any,
          origin: params.origin,
          processMethod: params.processMethod as any,
          bestFor: params.bestFor,
          exclusiveOnly: params.exclusiveOnly === 'true' || undefined,
        }}
      />
    </ClientAuthWrapper>
  )
}
