'use client'

import {BundleCard} from '@/components/bundle/BundleCard'
import {Button} from '@/components/ui'
import {useBundles} from '@/lib/hooks/useBundles'
import {useMembership} from '@/lib/hooks/useMembership'

export function BundlesClientWrapper() {
  const {isMember, mounted} = useMembership()

  // Use custom hook - will use hydrated data from server on initial load
  // When mounted becomes true and isMember changes, it will fetch fresh data
  const {data: bundles, isLoading, error} = useBundles(mounted ? isMember : false)

  // bundles comes from hydrated cache on initial load - no re-fetch needed
  const displayBundles = bundles ?? []

  return (
    <div>
      <header className="mb-xl">
        <h1 className="text-5xl font-black tracking-tighter mb-sm">Bundles</h1>
        <p className="text-lg text-text-muted">Curated coffee collections at special prices</p>
      </header>

      <main>
        {isLoading && !bundles && (
          <div className="text-center py-xxl">
            <div className="text-text-muted mb-lg">Loading bundles...</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="aspect-square bg-background-alt animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-xxl">
            <h2 className="text-2xl font-bold mb-md">Failed to load bundles</h2>
            <p className="text-text-muted mb-lg">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && displayBundles.length === 0 && (
          <div className="text-center py-xxl">
            <h2 className="text-2xl font-bold mb-md">No bundles available</h2>
            <p className="text-text-muted">Check back soon for new bundle offerings.</p>
          </div>
        )}

        {displayBundles.length > 0 && (
          <>
            <div className="mb-md">
              <p className="text-sm text-text-muted">
                {displayBundles.length} {displayBundles.length === 1 ? 'bundle' : 'bundles'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
              {displayBundles.map((bundle) => (
                <BundleCard key={bundle._id} bundle={bundle} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
