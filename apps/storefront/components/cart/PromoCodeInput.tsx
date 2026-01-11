'use client'

import {type FormEvent, useState} from 'react'

import {fsLog, trackPromoCodeFailed} from '@/lib/fullstory/utils'
import type {Promotion} from '@/lib/types'
import {InvalidPromoCodeError, PromoMinimumNotMetError} from '@/lib/types'

interface PromoCodeInputProps {
  onApply: (code: string) => Promise<void>
  appliedPromotion: Promotion | null
  disabled?: boolean
}

export function PromoCodeInput({onApply, appliedPromotion, disabled = false}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      return
    }

    setError(null)
    setSuccess(false)
    setIsApplying(true)

    try {
      await onApply(code.trim().toUpperCase())
      setSuccess(true)
      setCode('')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const submittedCode = code.trim().toUpperCase()

      if (err instanceof InvalidPromoCodeError) {
        setError('Invalid or expired promo code. Please check and try again.')
        trackPromoCodeFailed({
          promo_code: submittedCode,
          error_type: 'invalid',
        })
      } else if (err instanceof PromoMinimumNotMetError) {
        setError(err.message)
        trackPromoCodeFailed({
          promo_code: submittedCode,
          error_type: 'minimum_not_met',
        })
      } else if (err instanceof Error) {
        setError(err.message)
        fsLog('error', 'Promo code application failed', {
          promoCode: submittedCode,
          errorMessage: err.message,
        })
      } else {
        setError('Failed to apply promo code. Please try again.')
        fsLog('error', 'Promo code application failed with unknown error', {
          promoCode: submittedCode,
        })
      }
    } finally {
      setIsApplying(false)
    }
  }

  const hasPromotion = appliedPromotion !== null
  const isDisabled = disabled || isApplying || hasPromotion

  return (
    <div
      className="p-lg border border-border-light bg-background-secondary mt-lg"
      data-fs-element="promo-code-section"
      data-fs-promo-applied-bool={hasPromotion}
      data-fs-promo-code-str={appliedPromotion?.code}
      data-fs-properties-schema={JSON.stringify({
        'data-fs-promo-applied-bool': {type: 'bool', name: 'promoApplied'},
        'data-fs-promo-code-str': {type: 'str', name: 'promoCode'},
      })}
    >
      <h3 className="text-base font-bold mb-md text-text">Have a promo code?</h3>

      <form onSubmit={handleSubmit} className="mb-sm">
        <div className="flex gap-sm w-full">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            data-fs-element="promo-code-input"
            placeholder="Enter code"
            className="fs-unmask flex-1 min-w-0 px-md py-sm text-base border-2 border-border bg-background text-text font-mono uppercase tracking-wider focus:outline-none focus:border-primary transition-colors disabled:bg-disabled disabled:cursor-not-allowed disabled:opacity-60 placeholder:normal-case placeholder:tracking-normal"
            disabled={isDisabled}
            aria-label="Promo code"
            aria-describedby={error ? 'promo-error' : undefined}
          />
          <button
            type="submit"
            disabled={isDisabled || !code.trim()}
            className="px-md py-sm md:px-lg text-base font-bold bg-primary text-background border-2 border-primary cursor-pointer whitespace-nowrap transition-all duration-fast hover:bg-primary-dark hover:border-primary-dark disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Apply promo code"
          >
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </form>

      {error && (
        <p id="promo-error" className="text-sm text-error mt-sm" role="alert">
          {error}
        </p>
      )}

      {success && !hasPromotion && (
        <p className="text-sm text-success mt-sm font-medium" role="status">
          Promo code applied successfully!
        </p>
      )}

      {hasPromotion && (
        <div className="mt-md p-md bg-success-light border-2 border-success">
          <p className="text-base text-text mb-xs flex items-center gap-xs">
            <strong>{appliedPromotion.name}</strong>
            {appliedPromotion.code && (
              <span className="font-mono text-sm text-text-secondary">
                ({appliedPromotion.code})
              </span>
            )}
          </p>
          <p className="text-sm text-text-secondary mt-xs">
            Remove in order summary to apply a different code
          </p>
        </div>
      )}
    </div>
  )
}
