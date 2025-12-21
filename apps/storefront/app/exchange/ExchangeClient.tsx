'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'

import {useMembership} from '@/lib/hooks/useMembership'
import {urlFor} from '@/lib/sanity/image'
import type {Product} from '@/lib/types'

interface ExchangeClientProps {
  exclusiveProducts: Product[]
}

export function ExchangeClient({exclusiveProducts}: ExchangeClientProps) {
  const router = useRouter()
  const {isMember, mounted, isEnrolling, enrollMembership} = useMembership()

  const handleJoin = async () => {
    await enrollMembership()
    // Stay on exchange page to see exclusive products
    router.refresh()
  }

  return (
    <div className="w-full">
      <header className="text-center py-xl border-b-4 border-primary mb-xl">
        <h1 className="text-5xl font-black tracking-tighter mb-sm">The Exchange</h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-md">
          Access exclusive coffee drops and limited releases reserved for Exchange members
        </p>
        <span className="inline-block bg-primary text-background text-sm font-bold px-md py-xs uppercase tracking-wider">
          Members Only
        </span>
      </header>

      <section className="mb-xxl">
        <h2 className="text-2xl font-bold mb-lg text-center">What is The Exchange?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="p-lg bg-background-secondary border-2 border-border">
            <h3 className="text-lg font-bold mb-sm">Exclusive Access</h3>
            <p className="text-text-secondary">
              Get first access to rare, limited-edition coffees before they're available to the
              public
            </p>
          </div>
          <div className="p-lg bg-background-secondary border-2 border-border">
            <h3 className="text-lg font-bold mb-sm">Early Notifications</h3>
            <p className="text-text-secondary">
              Be the first to know about new drops, special releases, and seasonal offerings
            </p>
          </div>
          <div className="p-lg bg-background-secondary border-2 border-border">
            <h3 className="text-lg font-bold mb-sm">Premium Selection</h3>
            <p className="text-text-secondary">
              Curated collection of exceptional single-origins and experimental lots
            </p>
          </div>
        </div>
      </section>

      {exclusiveProducts.length > 0 && (
        <section className="mb-xxl">
          <h2 className="text-2xl font-bold mb-lg">Current Exclusive Drops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {exclusiveProducts.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="block border-2 border-border hover:shadow-brutal transition-all duration-fast no-underline group"
              >
                {product.image ? (
                  <img
                    src={urlFor(product.image).width(400).height(300).url()}
                    alt={product.name}
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-background-alt flex items-center justify-center">
                    <span className="text-4xl font-black text-text-muted">{product.name[0]}</span>
                  </div>
                )}

                <div className="p-md">
                  <h3 className="text-lg font-bold group-hover:underline mb-xs">{product.name}</h3>
                  <p className="text-text-secondary text-sm mb-sm">{product.origin}</p>
                  <div className="flex flex-wrap gap-sm mb-sm">
                    <span className="text-xs bg-background-alt px-sm py-xs border border-border">
                      {product.roastLevel}
                    </span>
                    <span className="text-xs bg-background-alt px-sm py-xs border border-border">
                      {product.processMethod}
                    </span>
                  </div>
                  {product.flavorProfile && product.flavorProfile.length > 0 && (
                    <div className="flex flex-wrap gap-xs">
                      {product.flavorProfile.slice(0, 3).map((flavor, index) => (
                        <span key={index} className="text-xs text-text-muted">
                          {flavor}
                          {index < Math.min(product.flavorProfile!.length, 3) - 1 && ' •'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="w-full max-w-xl mx-auto">
        <div className="p-xl bg-background-secondary border-2 border-primary text-center">
          {mounted && isMember ? (
            <>
              <h2 className="text-2xl font-bold mb-sm">You're an Exchange Member</h2>
              <p className="text-text-secondary mb-lg">
                Thank you for being part of The Exchange. You have access to all exclusive drops
                above.
              </p>
              <Link
                href="/products"
                className="inline-block bg-primary text-background px-lg py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast no-underline font-bold"
              >
                Browse All Products
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-sm">Join The Exchange</h2>
              <p className="text-text-secondary mb-lg">
                Membership is free and gives you immediate access to all exclusive drops and early
                notifications
              </p>
              <button
                onClick={handleJoin}
                disabled={isEnrolling}
                className="bg-primary text-background px-lg py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnrolling ? 'Joining...' : 'Become a Member'}
              </button>
              <p className="text-sm text-text-muted mt-md">
                Already a member?{' '}
                <Link href="/products" className="text-primary underline hover:no-underline">
                  Browse all products
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
