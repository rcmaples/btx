'use client'

import {useRouter} from 'next/navigation'

import {MembershipEnrollment} from '@/components/membership/MembershipEnrollment'
import {useMembership} from '@/lib/hooks/useMembership'
import {useAuth} from '@/lib/providers/AuthProvider'

export function MembershipClient() {
  const router = useRouter()
  const {user, profile, enrollInExchange} = useAuth()
  const {isMember, mounted, isEnrolling} = useMembership()

  const handleEnroll = async () => {
    if (user) {
      // Logged in: save to database
      const {error} = await enrollInExchange()
      if (!error) {
        // Clear localStorage since we're now using DB
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bt_membership')
        }
        router.push('/exchange')
      }
    } else {
      // Not logged in: redirect to login with return URL
      router.push('/login?redirect=/members')
    }
  }

  // Loading state before hydration
  if (!mounted) {
    return (
      <div className="text-center py-xxl">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  // Check DB membership for logged-in users
  const isActiveMember = user ? profile?.is_exchange_member : isMember

  // If already a member, show member status
  if (isActiveMember) {
    return (
      <div className="w-full text-center py-xxl">
        <div className="w-full max-w-xl mx-auto p-xl bg-green-50 border-2 border-success">
          <h1 className="text-4xl font-black mb-md">You&apos;re an Exchange Member</h1>
          <p className="text-text-secondary mb-lg">
            Thank you for being part of The Exchange. You now have access to all
            member-exclusive products and drops.
          </p>
          <button
            onClick={() => router.push('/exchange')}
            className="bg-primary text-background px-lg py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold"
          >
            Browse Exclusive Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <MembershipEnrollment
      onEnroll={handleEnroll}
      isEnrolling={isEnrolling}
      isLoggedIn={!!user}
    />
  )
}
