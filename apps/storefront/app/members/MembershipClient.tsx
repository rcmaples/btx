'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'

import {MembershipEnrollment} from '@/components/membership/MembershipEnrollment'
import {usePageName} from '@/lib/fullstory/hooks'
import {useMembership} from '@/lib/hooks/useMembership'

export function MembershipClient() {
  const router = useRouter()
  const {isMember, mounted, isEnrolling, enrollMembership, isLoggedIn, hasProfile} = useMembership()

  usePageName('Exchange Membership')

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      // Not logged in: redirect to login with return URL
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
      // Stay on page - the isMember state will update and show member UI
    } catch (error) {
      console.error('Failed to enroll:', error)
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

  // If already a member, show member status
  if (isMember) {
    return (
      <div className="w-full text-center py-xxl">
        <div className="w-full max-w-xl mx-auto p-xl bg-green-50 dark:bg-green-950/30 border-2 border-success">
          <h1 className="text-4xl font-black mb-md">You&apos;re an Exchange Member</h1>
          <p className="text-text-secondary mb-lg">
            Thank you for being part of The Exchange. You now have access to all member-exclusive
            products and drops.
          </p>
          <Link
            href="/products?exclusiveOnly=true"
            className="inline-block bg-primary text-background px-lg py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold no-underline"
          >
            Browse Exclusive Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <MembershipEnrollment
      onEnroll={handleEnroll}
      isEnrolling={isEnrolling}
      isLoggedIn={isLoggedIn}
    />
  )
}
