'use client'

import {useState} from 'react'

import {cancelExchangeMembership, enrollInExchange} from '@/lib/actions/profile'

type Props = {
  isExchangeMember: boolean
  exchangeEnrolledAt: Date | null
}

export function ExchangeMembershipSection({isExchangeMember, exchangeEnrolledAt}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnroll = async () => {
    setIsLoading(true)
    setError(null)

    const result = await enrollInExchange()

    if (!result.success) {
      setError(result.error || 'Failed to enroll')
    }

    setIsLoading(false)
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Exchange membership?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await cancelExchangeMembership()

    if (!result.success) {
      setError(result.error || 'Failed to cancel membership')
    }

    setIsLoading(false)
  }

  return (
    <section className="px-lg py-md md:py-lg">
      <h2 className="text-base font-bold uppercase tracking-wider text-text mb-sm">
        Exchange Membership
      </h2>

      {error && (
        <div
          className="p-sm bg-red-50 dark:bg-red-950/30 border border-error text-error mb-md text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {isExchangeMember ? (
        <div className="space-y-xs">
          <div className="flex items-baseline gap-sm flex-wrap">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Active Member</p>
            {exchangeEnrolledAt && (
              <p className="text-text-secondary text-sm">
                since {new Date(exchangeEnrolledAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <p className="text-text-secondary text-xs italic pb-md">
            Includes free shipping on all orders and access to exclusive products.
          </p>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="mt-xs px-md py-xs text-xs border border-error text-error font-semibold transition-colors hover:bg-error hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Cancel Membership'}
          </button>
        </div>
      ) : (
        <div className="space-y-xs">
          <p className="text-text-secondary text-sm">Not a member</p>
          <p className="text-text-secondary text-xs">
            Join to get free shipping and access to exclusive products.
          </p>
          <button
            onClick={handleEnroll}
            disabled={isLoading}
            className="mt-xs px-md py-xs text-xs bg-primary text-background border border-primary font-semibold transition-colors hover:bg-primary-dark hover:border-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Join the Exchange'}
          </button>
        </div>
      )}
    </section>
  )
}
