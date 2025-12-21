import {Metadata} from 'next'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {getProducts, getFilterOptions} from '@/lib/services/sanity/queries'
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
  const queryClient = new QueryClient()

  const initialFilters = {
    roastLevel: params.roastLevel as 'Light' | 'Medium' | 'Dark' | undefined,
    origin: params.origin,
    processMethod: params.processMethod as 'Washed' | 'Natural' | 'Honey' | undefined,
    bestFor: params.bestFor,
    exclusiveOnly: params.exclusiveOnly === 'true' || undefined,
  }

  // Prefetch products and filter options into query cache
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['products', 'list', {filters: initialFilters, isMember: false}],
      queryFn: () => getProducts({...initialFilters, isMember: false}),
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'filterOptions'],
      queryFn: getFilterOptions,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClientWrapper initialFilters={initialFilters} />
    </HydrationBoundary>
  )
}
