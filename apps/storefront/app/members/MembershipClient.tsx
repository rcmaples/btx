'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect, useRef} from 'react'

import {MembershipEnrollment} from '@/components/membership/MembershipEnrollment'
import {usePageName} from '@/lib/fullstory/hooks'
import {
  trackMembershipEnrollClicked,
  trackMembershipEnrolled,
  trackMembershipPageViewed,
} from '@/lib/fullstory/utils'
import {useMembership} from '@/lib/hooks/useMembership'

export function MembershipClient() {
  const router = useRouter()
  const {isMember, mounted, isEnrolling, enrollMembership, isLoggedIn, hasProfile} = useMembership()
  const hasTrackedPageView = useRef(false)

  usePageName('Exchange Membership')

  // Track membership page view once on mount
  useEffect(() => {
    if (mounted && !hasTrackedPageView.current) {
      trackMembershipPageViewed()
      hasTrackedPageView.current = true
    }
  }, [mounted])

  const handleEnroll = async () => {
    // Determine redirect reason if user can't enroll directly
    let redirectReason: 'login_required' | 'profile_required' | null = null
    if (!isLoggedIn) {
      redirectReason = 'login_required'
    } else if (!hasProfile) {
      redirectReason = 'profile_required'
    }

    // Track enroll button click with context
    trackMembershipEnrollClicked({
      is_logged_in: isLoggedIn,
      has_profile: hasProfile,
      redirect_reason: redirectReason,
    })

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
      // Track successful enrollment
      trackMembershipEnrolled()
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
