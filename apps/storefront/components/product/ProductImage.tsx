'use client'

import Image from 'next/image'
import {useState} from 'react'

import {urlFor} from '@/lib/sanity/image'
import type {ProductImage as ProductImageType, SanityImage} from '@/lib/types'

interface ProductImageProps {
  images?: ProductImageType[]
  image?: SanityImage // Legacy single image fallback
  alt: string
}

type ImageItem = ProductImageType | SanityImage

// Type guard to check if image has alt property
function hasAlt(img: ImageItem): img is ProductImageType {
  return 'alt' in img && typeof (img as ProductImageType).alt === 'string'
}

export function ProductImage({images, image, alt}: ProductImageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Use images array if available, otherwise fall back to legacy single image
  const imageList: ImageItem[] = images && images.length > 0 ? images : image ? [image] : []

  if (imageList.length === 0) {
    return (
      <div className="aspect-square bg-background-alt border-2 border-border flex items-center justify-center">
        <div className="text-center text-text-muted">
          <svg
            className="w-12 h-12 mx-auto mb-sm"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">No image available</span>
        </div>
      </div>
    )
  }

  const selectedImage = imageList[selectedIndex]
  const imageUrl = urlFor(selectedImage).width(800).height(800).format('webp').url()

  // Get alt text: use image's alt if available (ProductImage type), otherwise use provided alt
  const imageAlt = (hasAlt(selectedImage) ? selectedImage.alt : alt) || 'Product image'

  return (
    <div>
      {/* Main Image */}
      <div className="aspect-square bg-background-alt border-2 border-border overflow-hidden mb-sm">
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={800}
          height={800}
          className="w-full h-full object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnail Gallery - only show if multiple images */}
      {imageList.length > 1 && (
        <div className="flex gap-sm overflow-x-auto pb-sm">
          {imageList.map((img, index) => {
            const thumbUrl = urlFor(img).width(100).height(100).format('webp').url()
            const thumbAlt =
              (hasAlt(img) ? img.alt : alt ? `${alt} - Image ${index + 1}` : undefined) ||
              `Product image ${index + 1}`

            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`shrink-0 w-16 h-16 border-2 overflow-hidden transition-all duration-fast ${
                  selectedIndex === index
                    ? 'border-primary'
                    : 'border-border hover:border-text-muted'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={selectedIndex === index ? 'true' : undefined}
              >
                <Image
                  src={thumbUrl}
                  alt={thumbAlt}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
