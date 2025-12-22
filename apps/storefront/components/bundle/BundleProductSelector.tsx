'use client'

import Image from 'next/image'
import {useState} from 'react'

import {urlForImage} from '@/lib/sanity/utils'
import type {BundleProduct, Product} from '@/lib/types'

interface BundleProductSelectorProps {
  products: Product[]
  selectedProducts: BundleProduct[]
  onSelectProduct: (productId: string, price: number) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function BundleProductSelector({
  products,
  selectedProducts,
  onSelectProduct,
  onUpdateQuantity,
  onRemove,
}: BundleProductSelectorProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p) => p.productId === productId)
  }

  const getSelectedProduct = (productId: string) => {
    return selectedProducts.find((p) => p.productId === productId)
  }

  const getBasePrice = (product: Product) => {
    // Get the base price (first price entry or the one marked as base)
    if (!product.pricing || product.pricing.length === 0) return 0
    const baseEntry = product.pricing.find((p) => p.isBasePrice) || product.pricing[0]
    return baseEntry?.priceInCents || 0
  }

  const toggleProduct = (productId: string) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(productId)
    }
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-sm">Select Products for Bundle</h3>
      <p className="text-text-secondary text-sm mb-lg">
        Choose at least 2 products to create your bundle. Products will be added at their base size.
      </p>

      <div className="space-y-md">
        {products.map((product) => {
          const selected = isProductSelected(product._id)
          const selectedItem = getSelectedProduct(product._id)
          const basePrice = getBasePrice(product)
          const productImage = product.images?.[0] || product.image
          const isExpanded = expandedProduct === product._id
          const hasOptions = product.pricing && product.pricing.length > 0

          return (
            <div
              key={product._id}
              className={`border-2 bg-background ${selected ? 'border-primary' : 'border-border'}`}
            >
              <div
                className="flex items-center justify-between p-md cursor-pointer hover:bg-background-alt"
                onClick={() => toggleProduct(product._id)}
              >
                <div className="flex items-center gap-md">
                  {productImage && urlForImage(productImage) && (
                    <div className="relative w-16 h-16 flex-shrink-0 bg-background-alt">
                      <Image
                        src={urlForImage(productImage)!.width(128).height(128).format('webp').url()}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold">{product.name}</h4>
                    <p className="text-sm text-text-secondary">
                      {product.origin} • {product.roastLevel}
                    </p>
                    {selected && selectedItem && (
                      <span className="inline-block mt-xs text-xs bg-success text-background px-sm py-xxs">
                        Added to bundle (Qty: {selectedItem.quantity})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-xl font-bold border border-border hover:bg-primary hover:text-background transition-colors"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? '−' : '+'}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-md">
                  {hasOptions ? (
                    <div className="space-y-sm">
                      {/* Show base price option */}
                      <div
                        className={`flex items-center justify-between p-sm ${
                          selected
                            ? 'bg-primary/10 border border-primary'
                            : 'bg-background-secondary border border-border'
                        }`}
                      >
                        <div>
                          <span className="font-medium">Base Size</span>
                          <span className="ml-md font-mono">${(basePrice / 100).toFixed(2)}</span>
                        </div>

                        {selected && selectedItem ? (
                          <div className="flex items-center gap-sm">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={selectedItem.quantity}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value, 10)
                                if (qty >= 1 && qty <= 10) {
                                  onUpdateQuantity(product._id, qty)
                                }
                              }}
                              className="w-16 p-xs border border-border text-center"
                              aria-label="Quantity"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemove(product._id)
                              }}
                              className="text-sm text-danger hover:underline"
                              aria-label="Remove from bundle"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectProduct(product._id, basePrice)
                            }}
                            className="px-md py-xs bg-primary text-background text-sm font-medium hover:bg-primary-dark transition-colors"
                            aria-label={`Add ${product.name} to bundle`}
                          >
                            Add to Bundle
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      This product is not available for bundling.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-lg text-text-muted">
          <p>No products available for bundling.</p>
        </div>
      )}
    </div>
  )
}
