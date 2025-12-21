import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {getBundleBySlug, getBundles} from '@/lib/services/sanity/queries'

import {BundleDetailClient} from './BundleDetailClient'

interface BundlePageProps {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: BundlePageProps): Promise<Metadata> {
  const {slug} = await params
  const bundle = await getBundleBySlug(slug)

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

export async function generateStaticParams() {
  const bundles = await getBundles()
  return bundles.map((bundle) => ({
    slug: bundle.slug,
  }))
}

export default async function BundleDetailPage({params}: BundlePageProps) {
  const {slug} = await params
  const bundle = await getBundleBySlug(slug)

  if (!bundle) {
    notFound()
  }

  return <BundleDetailClient bundle={bundle} />
}
