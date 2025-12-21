'use client'

import {useState} from 'react'
import Link from 'next/link'
import {useCart} from '@/lib/hooks/useCart'
import {ProductImage} from '@/components/product/ProductImage'
import {ProductDescription} from '@/components/product/ProductDescription'
import {PurchaseOptionSelector} from '@/components/product/PurchaseOptionSelector'
import {SubscriptionConfigurator} from '@/components/subscription/SubscriptionConfigurator'
import type {Product, PurchaseSelection} from '@/lib/types'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({product}: ProductDetailClientProps) {
  const {addToCart, isLoading: isAddingToCart} = useCart()

  const [selectedPurchaseOption, setSelectedPurchaseOption] = useState<PurchaseSelection | null>(null)
  const [addToCartSuccess, setAddToCartSuccess] = useState(false)

  const handleAddToCart = async () => {
    if (!selectedPurchaseOption) return

    try {
      await addToCart(selectedPurchaseOption, 1)
      setAddToCartSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => setAddToCartSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart. Please try again.')
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
            <Link href="/products" className="text-text-muted hover:text-text">
              Products
            </Link>
          </li>
          <li className="text-text-muted">/</li>
          <li className="text-text font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Product Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xxl">
        <div>
          <ProductImage images={product.images} image={product.image} alt={product.name} />
        </div>

        <div>
          {product.isExclusiveDrop && (
            <div className="inline-block bg-primary text-background text-xs font-bold px-sm py-xs mb-md uppercase tracking-wider">
              Exchange Exclusive
            </div>
          )}

          <h1 className="text-4xl font-black tracking-tighter mb-md">{product.name}</h1>

          <div className="grid grid-cols-2 gap-sm mb-lg text-sm">
            <div className="flex gap-sm">
              <span className="text-text-muted">Origin:</span>
              <span className="font-medium">{product.origin}</span>
            </div>
            <div className="flex gap-sm">
              <span className="text-text-muted">Roast:</span>
              <span className="font-medium">{product.roastLevel}</span>
            </div>
            <div className="flex gap-sm">
              <span className="text-text-muted">Process:</span>
              <span className="font-medium">{product.processMethod}</span>
            </div>
            <div className="flex gap-sm">
              <span className="text-text-muted">Type:</span>
              <span className="font-medium">{product.productType}</span>
            </div>
          </div>

          <div className="mb-lg">
            <ProductDescription description={product.description} />
          </div>

          {product.flavorProfile && product.flavorProfile.length > 0 && (
            <div className="mb-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-sm">Tasting Notes</h3>
              <div className="flex flex-wrap gap-sm">
                {product.flavorProfile.map((flavor) => (
                  <span
                    key={flavor}
                    className="px-md py-xs bg-background-alt border border-border-light text-sm"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.bestFor && product.bestFor.length > 0 && (
            <div className="mb-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-sm">Best For</h3>
              <div className="flex flex-wrap gap-sm">
                {product.bestFor.map((method) => (
                  <span
                    key={method}
                    className="px-md py-xs bg-background-alt border border-border-light text-sm"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.pricing && product.pricing.length > 0 && (
            <div className="mb-lg">
              <PurchaseOptionSelector
                product={product}
                onSelect={setSelectedPurchaseOption}
              />
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!selectedPurchaseOption || isAddingToCart}
            className="w-full py-md bg-primary text-background border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            {!selectedPurchaseOption
              ? 'Select Options'
              : isAddingToCart
                ? 'Adding...'
                : addToCartSuccess
                  ? 'Added to Cart'
                  : 'Add to Cart'}
          </button>

          {addToCartSuccess && (
            <p className="mt-md text-center text-success">
              Product added to cart successfully!{' '}
              <Link href="/cart" className="underline hover:no-underline">
                View Cart
              </Link>
            </p>
          )}

          {/* Subscription Option */}
          <SubscriptionConfigurator product={product} selectedPurchaseOption={selectedPurchaseOption} />
        </div>
      </div>
    </div>
  )
}
