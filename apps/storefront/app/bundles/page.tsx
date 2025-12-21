import {Metadata} from 'next'

import {getBundles} from '@/lib/services/sanity/queries'

import {BundlesClientWrapper} from './BundlesClientWrapper'

export const metadata: Metadata = {
  title: 'Bundles',
  description: 'Curated coffee bundles at special prices.',
}

export default async function BundlesPage() {
  // Fetch bundles server-side (without membership for initial load)
  const bundles = await getBundles({isMember: false})

  return <BundlesClientWrapper initialBundles={bundles} />
}
