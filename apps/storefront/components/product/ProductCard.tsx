import Image from 'next/image'
import Link from 'next/link'

import {urlFor} from '@/lib/sanity/image'
import type {Product} from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({product}: ProductCardProps) {
  // Use first product shot from images array, fall back to legacy image field
  const productImage = product.images?.[0] || product.image
  const imageUrl = productImage
    ? urlFor(productImage).width(400).height(400).format('webp').url()
    : null

  return (
    <Link
      href={`/products/${product.slug}`}
      data-fs-element="product-card"
      data-fs-product-id-str={product._id}
      data-fs-product-name-str={product.name}
      data-fs-roast-level-str={product.roastLevel}
      data-fs-origin-str={product.origin}
      className="block border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
    >
      <div className="relative aspect-square bg-background-alt overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
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
        {product.isExclusiveDrop && (
          <div className="absolute top-sm left-sm bg-primary text-background text-xs font-bold px-sm py-xs uppercase tracking-wider">
            Exchange Exclusive
          </div>
        )}
      </div>

      <div className="p-md">
        <div className="mb-sm">
          <h3 className="text-lg font-bold mb-xs text-text group-hover:underline">
            {product.name}
          </h3>
          <p className="text-sm text-text-muted">{product.origin}</p>
        </div>

        <div className="text-sm text-text-secondary mb-sm">
          <span>{product.roastLevel}</span>
          <span className="mx-xs">•</span>
          <span>{product.processMethod}</span>
        </div>

        {product.flavorProfile && product.flavorProfile.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {product.flavorProfile.slice(0, 3).map((flavor) => (
              <span
                key={flavor}
                className="text-xs px-sm py-xxs bg-background-alt border border-border-light"
              >
                {flavor}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
