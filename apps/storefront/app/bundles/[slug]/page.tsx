import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'

import {FSPageName} from '@/components/common/FSPageName'
import {getBundleBySlug, getBundleSlugs} from '@/lib/services/sanity/queries'

import {BundleDetailClient} from './BundleDetailClient'

interface BundlePageProps {
  params: Promise<{slug: string}>
}

// Deduplicate requests between generateMetadata and page component
const getCachedBundle = cache(getBundleBySlug)

export async function generateMetadata({params}: BundlePageProps): Promise<Metadata> {
  const {slug} = await params
  const bundle = await getCachedBundle(slug)

  if (!bundle) {
    return {
      title: 'Bundle Not Found',
    }
  }

  return {
    title: bundle.name,
    description: bundle.description,
    openGraph: {
      title: `${bundle.name} | Batch Theory`,
      description: bundle.description,
    },
  }
}

// Use lightweight query - only fetch slugs, not full bundle data
export async function generateStaticParams() {
  const slugs = await getBundleSlugs()
  return slugs.map(({slug}) => ({slug}))
}

export default async function BundleDetailPage({params}: BundlePageProps) {
  const {slug} = await params
  const bundle = await getCachedBundle(slug)

  if (!bundle) {
    notFound()
  }

  return (
    <>
      <FSPageName pageName={`Bundle: ${bundle.name}`} />
      <BundleDetailClient bundle={bundle} />
    </>
  )
}
