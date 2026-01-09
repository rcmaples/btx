'use client'

import {useEffect, useState} from 'react'

import type {Product, PurchaseSelection} from '@/lib/types'

interface PurchaseOptionSelectorProps {
  product: Product
  onSelect: (selection: PurchaseSelection | null) => void
}

const DEFAULT_SIZE_KEY = '340g'
const DEFAULT_GRIND = 'Whole bean'

export function PurchaseOptionSelector({product, onSelect}: PurchaseOptionSelectorProps) {
  const {pricing = [], availableGrinds = []} = product

  // Sort pricing by grams for consistent display
  const sortedPricing = [...pricing].sort((a, b) => a.grams - b.grams)

  // Find default size (340g or first available)
  const defaultPriceEntry =
    sortedPricing.find((p) => p.sizeKey === DEFAULT_SIZE_KEY) ||
    sortedPricing.find((p) => p.isBasePrice) ||
    sortedPricing[0]

  // Find default grind (Whole bean or first available)
  const defaultGrind =
    availableGrinds.find((g) => g.toLowerCase() === DEFAULT_GRIND.toLowerCase()) ||
    availableGrinds[0]

  const [selectedSizeKey, setSelectedSizeKey] = useState<string>(defaultPriceEntry?.sizeKey || '')
  const [selectedGrind, setSelectedGrind] = useState<string>(defaultGrind || '')

  // Get current price entry
  const selectedPriceEntry = sortedPricing.find((p) => p.sizeKey === selectedSizeKey)

  // Emit selection on any change
  useEffect(() => {
    if (selectedSizeKey && selectedGrind && selectedPriceEntry) {
      onSelect({
        productId: product._id,
        productName: product.name,
        sizeKey: selectedSizeKey,
        sizeName: selectedPriceEntry.sizeName,
        grams: selectedPriceEntry.grams,
        grind: selectedGrind,
        priceInCents: selectedPriceEntry.priceInCents,
      })
    } else {
      onSelect(null)
    }
  }, [selectedSizeKey, selectedGrind, selectedPriceEntry, product._id, product.name, onSelect])

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`
  }

  if (sortedPricing.length === 0 || availableGrinds.length === 0) {
    return (
      <div className="p-md bg-background-alt border border-border-light text-center">
        <p className="text-text-muted">Purchase options are not available for this product.</p>
      </div>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Size Selection */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-sm">Size</h3>
        <div className="grid grid-cols-3 gap-sm">
          {sortedPricing.map((priceEntry) => {
            const isSelected = selectedSizeKey === priceEntry.sizeKey

            return (
              <button
                key={priceEntry._key}
                onClick={() => setSelectedSizeKey(priceEntry.sizeKey)}
                data-fs-element="size-selector-button"
                data-fs-size-key-str={priceEntry.sizeKey}
                data-fs-size-name-str={priceEntry.sizeName}
                data-fs-price-real={priceEntry.priceInCents / 100}
                data-fs-is-selected-bool={isSelected}
                data-fs-properties-schema={JSON.stringify({
                  'data-fs-size-key-str': {type: 'str', name: 'sizeKey'},
                  'data-fs-size-name-str': {type: 'str', name: 'sizeName'},
                  'data-fs-price-real': {type: 'real', name: 'price'},
                  'data-fs-is-selected-bool': {type: 'bool', name: 'isSelected'},
                })}
                className={`p-md border-2 transition-all duration-fast text-center ${
                  isSelected
                    ? 'border-primary bg-primary text-background'
                    : 'border-border hover:border-primary'
                }`}
              >
                <span className="block font-medium">{priceEntry.sizeName}</span>
                <span className="block text-sm mt-xs opacity-80">
                  {formatPrice(priceEntry.priceInCents)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grind Selection */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-sm">Grind</h3>
        <div
          className={`grid gap-sm ${
            availableGrinds.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {availableGrinds.map((grind) => {
            const isSelected = selectedGrind === grind

            return (
              <button
                key={grind}
                onClick={() => setSelectedGrind(grind)}
                data-fs-element="grind-selector-button"
                data-fs-grind-str={grind}
                data-fs-is-selected-bool={isSelected}
                data-fs-properties-schema={JSON.stringify({
                  'data-fs-grind-str': {type: 'str', name: 'grind'},
                  'data-fs-is-selected-bool': {type: 'bool', name: 'isSelected'},
                })}
                className={`p-md border-2 transition-all duration-fast text-center ${
                  isSelected
                    ? 'border-primary bg-primary text-background'
                    : 'border-border hover:border-primary'
                }`}
              >
                <span className="block font-medium">{grind}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Display */}
      {selectedPriceEntry && (
        <div className="pt-lg border-t border-border-light">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Price:</span>
            <span className="text-2xl font-black font-mono">
              {formatPrice(selectedPriceEntry.priceInCents)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
