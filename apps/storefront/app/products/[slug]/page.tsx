import type {PortableTextBlock} from '@portabletext/types'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'

import {getProductBySlug, getProductSlugs} from '@/lib/services/sanity/queries'

import {ProductDetailClient} from './ProductDetailClient'

// Extract plain text from Portable Text blocks for meta description
function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  return blocks
    .filter((block) => block._type === 'block')
    .map((block) => {
      const children = block.children as Array<{_type: string; text?: string}>
      return (
        children
          ?.filter((child) => child._type === 'span')
          .map((span) => span.text)
          .join('') ?? ''
      )
    })
    .join(' ')
    .slice(0, 160)
}

interface ProductPageProps {
  params: Promise<{slug: string}>
}

// Deduplicate requests between generateMetadata and page component
const getCachedProduct = cache(getProductBySlug)

export async function generateMetadata({params}: ProductPageProps): Promise<Metadata> {
  const {slug} = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const description = portableTextToPlainText(product.description)
  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | Batch Theory`,
      description,
    },
  }
}

// Use lightweight query - only fetch slugs, not full product data
export async function generateStaticParams() {
  const slugs = await getProductSlugs()
  return slugs.map(({slug}) => ({slug}))
}

export default async function ProductDetailPage({params}: ProductPageProps) {
  const {slug} = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
