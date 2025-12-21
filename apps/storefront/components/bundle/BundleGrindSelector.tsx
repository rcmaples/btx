'use client'

interface BundleGrindSelectorProps {
  products: Array<{availableGrinds?: string[]}>
  selectedGrind: string
  onGrindSelect: (grind: string) => void
}

const DEFAULT_GRIND = 'Whole bean'

/**
 * Computes the intersection of available grinds across all products.
 * Only considers products that have availableGrinds defined.
 * Falls back to DEFAULT_GRIND if no intersection can be computed.
 */
function computeGrindIntersection(
  products: Array<{availableGrinds?: string[]}>
): string[] {
  if (products.length === 0) return [DEFAULT_GRIND]

  // Filter to only products that have grinds defined
  const productsWithGrinds = products.filter(
    (p) => p.availableGrinds && p.availableGrinds.length > 0
  )

  // If no products have grinds defined, fall back to default
  if (productsWithGrinds.length === 0) return [DEFAULT_GRIND]

  const grindSets = productsWithGrinds.map((p) => new Set(p.availableGrinds))

  // Find intersection: grinds that exist in ALL sets
  const intersection = [...grindSets[0]].filter((grind) =>
    grindSets.every((set) => set.has(grind))
  )

  // If intersection is empty (products have no common grinds), fall back to default
  if (intersection.length === 0) return [DEFAULT_GRIND]

  return intersection
}

export function BundleGrindSelector({
  products,
  selectedGrind,
  onGrindSelect,
}: BundleGrindSelectorProps) {
  const availableGrinds = computeGrindIntersection(products)

  if (availableGrinds.length === 0) {
    return (
      <div className="mb-lg p-md bg-background-alt border border-border-light">
        <p className="text-text-muted text-sm">
          Grind selection is not available for this bundle.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-lg">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-sm">
        Grind
      </h3>
      <div
        className={`grid gap-sm ${
          availableGrinds.length <= 3
            ? 'grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {availableGrinds.map((grind) => {
          const isSelected = selectedGrind === grind

          return (
            <button
              key={grind}
              onClick={() => onGrindSelect(grind)}
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
  )
}

export {computeGrindIntersection, DEFAULT_GRIND}
