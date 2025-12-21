import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Batch Theory - Specialty Coffee',
  description:
    'Premium coffee for those who take it seriously. Browse our selection of specialty coffee, curated bundles, and exclusive drops.',
}

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-huge">
        <h1 className="text-5xl font-black tracking-tighter mb-md">Batch Theory</h1>
        <p className="text-xl text-text-muted mb-xl max-w-2xl mx-auto">
          Premium coffee for those who take it seriously
        </p>
        <div className="flex gap-md justify-center flex-wrap">
          <Link
            href="/products"
            className="bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast no-underline font-bold text-lg"
          >
            Browse Products
          </Link>
          <Link
            href="/exchange"
            className="bg-transparent text-primary px-xl py-md border-2 border-primary hover:bg-primary hover:text-background transition-all duration-fast no-underline font-bold text-lg"
          >
            Join Exchange
          </Link>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <Link
          href="/bundles"
          className="block p-xl border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
        >
          <h2 className="text-2xl font-bold mb-sm group-hover:underline">Bundles</h2>
          <p className="text-text-muted">Curated coffee collections at special pricing</p>
        </Link>

        <Link
          href="/exchange"
          className="block p-xl border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
        >
          <h2 className="text-2xl font-bold mb-sm group-hover:underline">The Exchange</h2>
          <p className="text-text-muted">Exclusive drops for members only</p>
        </Link>

        <Link
          href="/release-notes"
          className="block p-xl border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
        >
          <h2 className="text-2xl font-bold mb-sm group-hover:underline">Release Notes</h2>
          <p className="text-text-muted">Latest updates and improvements</p>
        </Link>
      </section>
    </div>
  )
}
