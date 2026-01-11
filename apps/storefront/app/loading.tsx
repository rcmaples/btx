export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-md py-xl">
      {/* Header skeleton */}
      <div className="mb-xl">
        <div className="h-10 w-64 bg-border/30 animate-pulse rounded mb-md" />
        <div className="h-5 w-96 bg-border/20 animate-pulse rounded" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-2 border-border p-lg animate-pulse">
            {/* Image placeholder */}
            <div className="w-full aspect-square bg-border/30 mb-md" />

            {/* Title placeholder */}
            <div className="h-6 bg-border/30 mb-sm" />

            {/* Description placeholders */}
            <div className="space-y-xs mb-md">
              <div className="h-4 bg-border/20 w-full" />
              <div className="h-4 bg-border/20 w-3/4" />
            </div>

            {/* Price placeholder */}
            <div className="h-8 bg-border/30 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
