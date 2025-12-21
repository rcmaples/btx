import {Metadata} from 'next'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'

import {getBundles} from '@/lib/services/sanity/queries'

import {BundlesClientWrapper} from './BundlesClientWrapper'

export const metadata: Metadata = {
  title: 'Bundles',
  description: 'Curated coffee bundles at special prices.',
}

export default async function BundlesPage() {
  const queryClient = new QueryClient()

  // Prefetch bundles into query cache with same key that useBundles uses
  await queryClient.prefetchQuery({
    queryKey: ['bundles', 'list', {isMember: false}],
    queryFn: () => getBundles({isMember: false}),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BundlesClientWrapper />
    </HydrationBoundary>
  )
}
