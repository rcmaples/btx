'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useEffect, useMemo, useState} from 'react'

import {
  BundleGrindSelector,
  computeGrindIntersection,
  DEFAULT_GRIND,
} from '@/components/bundle/BundleGrindSelector'
import {useCart} from '@/lib/hooks/useCart'
import {urlFor} from '@/lib/sanity/image'
import type {SanityBundle} from '@/lib/types'

interface BundleDetailClientProps {
  bundle: SanityBundle
}

export function BundleDetailClient({bundle}: BundleDetailClientProps) {
  const {addBundleToCart, isLoading: isAddingToCart} = useCart()
  const [addToCartSuccess, setAddToCartSuccess] = useState(false)

  // Compute available grinds (intersection of all products' grinds)
  const availableGrinds = useMemo(() => {
    return computeGrindIntersection(bundle.products || [])
  }, [bundle.products])

  // Initialize grind selection
  const [selectedGrind, setSelectedGrind] = useState<string>(() => {
    const grinds = computeGrindIntersection(bundle.products || [])
    return grinds.includes(DEFAULT_GRIND) ? DEFAULT_GRIND : grinds[0] || ''
  })

  // Update default grind if bundle products change
  useEffect(() => {
    if (availableGrinds.length > 0 && !availableGrinds.includes(selectedGrind)) {
      setSelectedGrind(availableGrinds.includes(DEFAULT_GRIND) ? DEFAULT_GRIND : availableGrinds[0])
    }
  }, [availableGrinds, selectedGrind])

  // Use bundle image, or fall back to first product's image
  const bundleImage =
    bundle.image || bundle.products?.[0]?.images?.[0] || bundle.products?.[0]?.image
  const imageUrl = bundleImage
    ? urlFor(bundleImage).width(800).height(800).format('webp').url()
    : null

  const formattedPrice = (bundle.price / 100).toFixed(2)
  const formattedSavings = bundle.savingsAmount ? (bundle.savingsAmount / 100).toFixed(2) : null

  const handleAddToCart = async () => {
    try {
      await addBundleToCart({...bundle, grind: selectedGrind})
      setAddToCartSuccess(true)
      setTimeout(() => setAddToCartSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add bundle to cart:', error)
      alert('Failed to add bundle to cart. Please try again.')
    }
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-lg" aria-label="Breadcrumb">
        <ol className="flex items-center gap-sm text-sm">
          <li>
            <Link href="/" className="text-text-muted hover:text-text">
              Home
            </Link>
          </li>
          <li className="text-text-muted">/</li>
          <li>
            <Link href="/bundles" className="text-text-muted hover:text-text">
              Bundles
            </Link>
          </li>
          <li className="text-text-muted">/</li>
          <li className="text-text font-medium">{bundle.name}</li>
        </ol>
      </nav>

      {/* Bundle Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xxl">
        <div>
          <div className="relative aspect-square bg-background-alt overflow-hidden border-2 border-border">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={bundle.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-text-muted">No Image</span>
              </div>
            )}
            {bundle.isExclusiveDrop && (
              <div className="absolute top-md left-md bg-primary text-background text-sm font-bold px-md py-sm uppercase tracking-wider">
                Exchange Exclusive
              </div>
            )}
          </div>
        </div>

        <div>
          {bundle.isExclusiveDrop && (
            <div className="inline-block bg-primary text-background text-xs font-bold px-sm py-xs mb-md uppercase tracking-wider">
              Exchange Exclusive
            </div>
          )}

          <h1 className="text-4xl font-black tracking-tighter mb-md">{bundle.name}</h1>

          <div className="flex items-center gap-md mb-lg">
            <span className="text-3xl font-bold">${formattedPrice}</span>
            {formattedSavings && (
              <span className="bg-accent text-background text-sm font-bold px-md py-sm">
                Save ${formattedSavings}
              </span>
            )}
          </div>

          {bundle.description && (
            <p className="text-text-secondary mb-lg leading-relaxed">{bundle.description}</p>
          )}

          {/* Included Products */}
          {bundle.products && bundle.products.length > 0 && (
            <div className="mb-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-md">
                Includes {bundle.products.length} Coffees
              </h3>
              <div className="space-y-sm">
                {bundle.products.map((product) => {
                  const productImage = product.images?.[0] || product.image
                  return (
                    <Link
                      key={product._id}
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-md p-sm bg-background-alt border border-border-light hover:border-border transition-colors"
                    >
                      {productImage && (
                        <Image
                          src={urlFor(productImage).width(60).height(60).format('webp').url()}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="w-[60px] h-[60px] object-cover"
                          unoptimized
                        />
                      )}
                      <div>
                        <span className="font-medium text-text">{product.name}</span>
                        <div className="text-sm text-text-muted">
                          {product.origin} • {product.roastLevel}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Size Display - Bundles are 240g only */}
          <div className="mb-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-sm">Size</h3>
            <div className="inline-block">
              <div className="p-md border-2 border-primary bg-primary text-background text-center min-w-[100px]">
                <span className="block font-medium">240g (each)</span>
              </div>
            </div>
          </div>

          {/* Grind Selection */}
          <BundleGrindSelector
            products={bundle.products || []}
            selectedGrind={selectedGrind}
            onGrindSelect={setSelectedGrind}
          />

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || availableGrinds.length === 0}
            className="w-full py-md bg-primary text-background border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            {isAddingToCart
              ? 'Adding...'
              : addToCartSuccess
                ? 'Added to Cart!'
                : 'Add Bundle to Cart'}
          </button>

          {addToCartSuccess && (
            <p className="mt-md text-center text-success">
              Bundle added to cart!{' '}
              <Link href="/cart" className="underline hover:no-underline">
                View Cart
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
