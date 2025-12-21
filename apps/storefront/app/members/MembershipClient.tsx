'use client'

import {useRouter} from 'next/navigation'

import {MembershipEnrollment} from '@/components/membership/MembershipEnrollment'
import {useMembership} from '@/lib/hooks/useMembership'

export function MembershipClient() {
  const router = useRouter()
  const {isMember, mounted, isEnrolling, enrollMembership} = useMembership()

  const handleEnroll = async () => {
    await enrollMembership()
    // Navigate to products page to see exclusive products
    setTimeout(() => {
      router.push('/products')
    }, 1000)
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
        <div className="w-full max-w-xl mx-auto p-xl bg-success-light border-2 border-success">
          <h1 className="text-4xl font-black mb-md">You're an Exchange Member</h1>
          <p className="text-text-secondary mb-lg">
            Thank you for being part of The Exchange. You now have access to all member-exclusive
            products and drops.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-primary text-background px-lg py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold"
          >
            Browse Exclusive Products
          </button>
        </div>
      </div>
    )
  }

  return <MembershipEnrollment onEnroll={handleEnroll} isEnrolling={isEnrolling} />
}
