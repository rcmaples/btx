'use client'

import Link from 'next/link'
import {useState} from 'react'

interface MembershipEnrollmentProps {
  onEnroll: () => Promise<void>
  isEnrolling: boolean
  isLoggedIn?: boolean
}

export function MembershipEnrollment({
  onEnroll,
  isEnrolling,
  isLoggedIn = false,
}: MembershipEnrollmentProps) {
  const [error, setError] = useState<string | null>(null)

  const handleEnroll = async () => {
    setError(null)

    try {
      await onEnroll()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to enroll in membership. Please try again.')
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center py-xl bg-background-alt border-b-4 border-primary mb-xl">
        <h1 className="text-5xl font-black tracking-tighter mb-sm">The Exchange</h1>
        <p className="text-lg text-text-secondary">Join our community of coffee enthusiasts</p>
      </div>

      <div className="mb-xl">
        <h2 className="text-2xl font-bold mb-lg">Member Benefits</h2>
        <ul className="space-y-md">
          <li className="p-md bg-background-secondary border-l-4 border-primary">
            <strong className="block font-bold mb-xs">Exclusive Access</strong>
            <p className="text-text-secondary text-sm">
              First access to limited-edition single-origin drops and experimental roasts
            </p>
          </li>
          <li className="p-md bg-background-secondary border-l-4 border-primary">
            <strong className="block font-bold mb-xs">Member-Only Products</strong>
            <p className="text-text-secondary text-sm">
              Curated selections available exclusively to Exchange members
            </p>
          </li>
          <li className="p-md bg-background-secondary border-l-4 border-primary">
            <strong className="block font-bold mb-xs">Priority Access</strong>
            <p className="text-text-secondary text-sm">
              Be the first to know about new releases and special offerings
            </p>
          </li>
          <li className="p-md bg-background-secondary border-l-4 border-primary">
            <strong className="block font-bold mb-xs">Editorial Content</strong>
            <p className="text-text-secondary text-sm">
              Access to in-depth Release Notes and brewing guides
            </p>
          </li>
        </ul>
      </div>

      <div className="p-xl bg-background-secondary border-2 border-border text-center">
        {!isLoggedIn && (
          <div className="p-md bg-warning-light border border-warning text-sm mb-lg">
            <strong>Note:</strong> You&apos;ll need to{' '}
            <Link href="/login?redirect=/members" className="text-primary underline">
              log in
            </Link>{' '}
            or{' '}
            <Link href="/signup?redirect=/members" className="text-primary underline">
              create an account
            </Link>{' '}
            to join The Exchange.
          </div>
        )}

        {error && (
          <div className="p-md bg-danger-light border border-danger text-danger mb-lg" role="alert">
            {error}
          </div>
        )}

        <button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnrolling ? 'Enrolling...' : isLoggedIn ? 'Join The Exchange' : 'Sign In to Join'}
        </button>
      </div>
    </div>
  )
}
