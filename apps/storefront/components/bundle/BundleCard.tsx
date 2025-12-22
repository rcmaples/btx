import Image from 'next/image'
import Link from 'next/link'

import {urlFor} from '@/lib/sanity/image'
import type {SanityBundle} from '@/lib/types'

interface BundleCardProps {
  bundle: SanityBundle
}

export function BundleCard({bundle}: BundleCardProps) {
  // Use bundle image, or fall back to first product's image
  const bundleImage =
    bundle.image || bundle.products?.[0]?.images?.[0] || bundle.products?.[0]?.image
  const imageUrl = bundleImage
    ? urlFor(bundleImage).width(400).height(400).format('webp').url()
    : null

  const formattedPrice = (bundle.price / 100).toFixed(2)
  const formattedSavings = bundle.savingsAmount ? (bundle.savingsAmount / 100).toFixed(2) : null

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="block border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
    >
      <div className="relative aspect-square bg-background-alt overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={bundle.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-text-muted text-sm">No Image</span>
          </div>
        )}
        {bundle.isExclusiveDrop && (
          <div className="absolute top-sm left-sm bg-primary text-background text-xs font-bold px-sm py-xs uppercase tracking-wider">
            Exchange Exclusive
          </div>
        )}
        {formattedSavings && (
          <div className="absolute top-sm right-sm bg-accent text-background text-xs font-bold px-sm py-xs uppercase tracking-wider">
            Save ${formattedSavings}
          </div>
        )}
      </div>

      <div className="p-md">
        <div className="mb-sm">
          <h3 className="text-lg font-bold mb-xs text-text group-hover:underline">{bundle.name}</h3>
          {bundle.description && (
            <p className="text-sm text-text-muted line-clamp-2">{bundle.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${formattedPrice}</span>
          {bundle.products && (
            <span className="text-sm text-text-muted">
              {bundle.products.length} {bundle.products.length === 1 ? 'coffee' : 'coffees'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
