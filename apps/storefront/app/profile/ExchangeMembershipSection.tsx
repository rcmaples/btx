'use client'

import {useState} from 'react'

import {enrollInExchange, cancelExchangeMembership} from '@/lib/actions/profile'

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
    <section className="bg-background-secondary border-2 border-border p-xl">
      <h2 className="text-xl font-bold mb-lg">Exchange Membership</h2>

      {error && (
        <div className="p-md bg-red-50 border border-error text-error mb-lg" role="alert">
          {error}
        </div>
      )}

      {isExchangeMember ? (
        <div className="space-y-md">
          <div>
            <p className="text-success font-medium">Active Member</p>
            {exchangeEnrolledAt && (
              <p className="text-text-secondary text-sm">
                Member since {new Date(exchangeEnrolledAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <p className="text-text-secondary text-sm">
            As an Exchange member, you enjoy free shipping on all orders and access to exclusive
            products.
          </p>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-lg py-sm border-2 border-error text-error font-semibold transition-colors hover:bg-error hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Cancel Membership'}
          </button>
        </div>
      ) : (
        <div className="space-y-md">
          <p className="text-text-secondary">Not an Exchange member</p>
          <p className="text-text-secondary text-sm">
            Join the Exchange to get free shipping on all orders and access to exclusive products.
          </p>
          <button
            onClick={handleEnroll}
            disabled={isLoading}
            className="px-lg py-sm bg-primary text-background border-2 border-primary font-semibold transition-colors hover:bg-primary-dark hover:border-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Join the Exchange'}
          </button>
        </div>
      )}
    </section>
  )
}
