'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'

import {useMembership} from '@/lib/hooks/useMembership'

export function ExchangeClient() {
  const router = useRouter()
  const {isMember, mounted, isEnrolling, enrollMembership, isLoggedIn, hasProfile} = useMembership()

  const handleJoin = async () => {
    if (!isLoggedIn) {
      // Not logged in: redirect to login
      router.push('/login?redirect_url=/members')
      return
    }

    if (!hasProfile) {
      // Logged in but no profile: redirect to complete profile
      router.push('/complete-profile?redirect_url=/members')
      return
    }

    // Logged in with profile: enroll in Exchange
    try {
      await enrollMembership()
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
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
              Get first access to rare, limited-edition coffees before they&apos;re available to the
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

      <section className="w-full max-w-xl mx-auto">
        <div className="p-xl bg-background-secondary border-2 border-primary text-center">
          {mounted && isMember ? (
            <>
              <h2 className="text-2xl font-bold mb-sm">You&apos;re an Exchange Member</h2>
              <p className="text-text-secondary mb-lg">
                Thank you for being part of The Exchange. You have access to all exclusive drops and
                member-only products.
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
                {isEnrolling ? 'Joining...' : isLoggedIn ? 'Become a Member' : 'Sign In to Join'}
              </button>
              {!isLoggedIn && (
                <p className="text-sm text-text-muted mt-md">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup?redirect_url=/members"
                    className="text-primary underline hover:no-underline"
                  >
                    Sign up
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
