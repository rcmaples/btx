'use client'

import {FSSelect} from '@/components/fs/FSSelect'
import {useFilterOptions} from '@/lib/hooks/useProducts'
import type {ProductFilters as Filters} from '@/lib/types'

interface ProductFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  isMember?: boolean
}

export function ProductFilters({filters, onChange, isMember = false}: ProductFiltersProps) {
  const {data: options, isLoading} = useFilterOptions()

  const handleFilterChange = (key: keyof Filters, value: string | undefined) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const handleExclusiveToggle = (checked: boolean) => {
    onChange({
      ...filters,
      exclusiveOnly: checked || undefined,
    })
  }

  const clearFilters = () => {
    onChange({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined)

  if (isLoading || !options) {
    return (
      <div className="p-md border-2 border-border">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-lg font-bold">Filters</h2>
        </div>
        <div className="text-text-muted animate-pulse">Loading filters...</div>
      </div>
    )
  }

  return (
    <aside className="p-md border-2 border-border" role="region" aria-label="Product filters">
      <div className="flex items-center justify-between mb-md">
        <h2 className="text-lg font-bold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-text-muted hover:text-text underline"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-md">
        <FSSelect
          label="Roast Level"
          id="roast-filter"
          data-fs-element="roast-level-filter"
          value={filters.roastLevel || ''}
          onChange={(e) => handleFilterChange('roastLevel', e.target.value || undefined)}
          options={options.roastLevels.map((roast) => ({value: roast, label: roast}))}
          placeholder="All Roasts"
          privacy="unmask"
          optional
        />

        <FSSelect
          label="Origin"
          id="origin-filter"
          data-fs-element="origin-filter"
          value={filters.origin || ''}
          onChange={(e) => handleFilterChange('origin', e.target.value || undefined)}
          options={options.origins.map((origin) => ({value: origin, label: origin}))}
          placeholder="All Origins"
          privacy="unmask"
          optional
        />

        <FSSelect
          label="Process Method"
          id="process-filter"
          data-fs-element="process-method-filter"
          value={filters.processMethod || ''}
          onChange={(e) => handleFilterChange('processMethod', e.target.value || undefined)}
          options={options.processMethods.map((method) => ({value: method, label: method}))}
          placeholder="All Methods"
          privacy="unmask"
          optional
        />

        <FSSelect
          label="Best For"
          id="best-for-filter"
          value={filters.bestFor || ''}
          onChange={(e) => handleFilterChange('bestFor', e.target.value || undefined)}
          options={options.bestFor.map((method) => ({value: method, label: method}))}
          placeholder="All Brewing Methods"
          privacy="unmask"
          optional
        />

        {isMember && (
          <div className="pt-md border-t border-border-light">
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                className="fs-unmask w-[18px] h-[18px] border-2 border-border accent-primary cursor-pointer"
                checked={filters.exclusiveOnly || false}
                onChange={(e) => handleExclusiveToggle(e.target.checked)}
                aria-describedby="exclusive-description"
              />
              <span className="text-sm font-medium">Show Exclusive Only</span>
              <span className="text-xs bg-primary text-background px-xs py-xxs font-bold">
                Exchange
              </span>
            </label>
            <span id="exclusive-description" className="sr-only">
              Filter to show only Exchange membership exclusive products
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
