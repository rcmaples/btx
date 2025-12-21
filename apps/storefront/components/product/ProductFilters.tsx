'use client';

import { useFilterOptions } from '@/lib/hooks/useProducts';
import type { ProductFilters as Filters } from '@/lib/types';

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  isMember?: boolean;
}

export function ProductFilters({
  filters,
  onChange,
  isMember = false,
}: ProductFiltersProps) {
  const { data: options, isLoading } = useFilterOptions();

  const handleFilterChange = (
    key: keyof Filters,
    value: string | undefined
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleExclusiveToggle = (checked: boolean) => {
    onChange({
      ...filters,
      exclusiveOnly: checked || undefined,
    });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined
  );

  if (isLoading || !options) {
    return (
      <div className="p-md border-2 border-border">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-lg font-bold">Filters</h2>
        </div>
        <div className="text-text-muted animate-pulse">Loading filters...</div>
      </div>
    );
  }

  return (
    <aside
      className="p-md border-2 border-border"
      role="region"
      aria-label="Product filters"
    >
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
        <div>
          <label
            className="block text-sm font-medium mb-xs"
            htmlFor="roast-filter"
          >
            Roast Level
          </label>
          <select
            id="roast-filter"
            className="w-full p-sm border-2 border-border bg-background focus:outline-none focus:border-primary"
            value={filters.roastLevel || ''}
            onChange={(e) =>
              handleFilterChange('roastLevel', e.target.value || undefined)
            }
          >
            <option value="">All Roasts</option>
            {options.roastLevels.map((roast) => (
              <option key={roast} value={roast}>
                {roast}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-xs"
            htmlFor="origin-filter"
          >
            Origin
          </label>
          <select
            id="origin-filter"
            className="w-full p-sm border-2 border-border bg-background focus:outline-none focus:border-primary"
            value={filters.origin || ''}
            onChange={(e) =>
              handleFilterChange('origin', e.target.value || undefined)
            }
          >
            <option value="">All Origins</option>
            {options.origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-xs"
            htmlFor="process-filter"
          >
            Process Method
          </label>
          <select
            id="process-filter"
            className="w-full p-sm border-2 border-border bg-background focus:outline-none focus:border-primary"
            value={filters.processMethod || ''}
            onChange={(e) =>
              handleFilterChange('processMethod', e.target.value || undefined)
            }
          >
            <option value="">All Methods</option>
            {options.processMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-xs"
            htmlFor="best-for-filter"
          >
            Best For
          </label>
          <select
            id="best-for-filter"
            className="w-full p-sm border-2 border-border bg-background focus:outline-none focus:border-primary"
            value={filters.bestFor || ''}
            onChange={(e) =>
              handleFilterChange('bestFor', e.target.value || undefined)
            }
          >
            <option value="">All Brewing Methods</option>
            {options.bestFor.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {isMember && (
          <div className="pt-md border-t border-border-light">
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-[18px] h-[18px] border-2 border-border accent-primary cursor-pointer"
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
  );
}
