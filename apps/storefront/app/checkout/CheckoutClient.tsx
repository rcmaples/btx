'use client'

import {useEffect, useMemo, useState} from 'react'

import {CheckoutSuccess} from '@/components/checkout/CheckoutSuccess'
import {OrderSummary} from '@/components/checkout/OrderSummary'
import {PaymentForm} from '@/components/checkout/PaymentForm'
import {ShippingAddressForm} from '@/components/checkout/ShippingAddressForm'
import {usePageName} from '@/lib/fullstory/hooks'
import {useCart} from '@/lib/hooks/useCart'
import type {ShippingAddress} from '@/lib/types/checkout'

import {createOrder} from './actions'

interface User {
  id: string
  email?: string
}

interface Profile {
  isExchangeMember: boolean
  streetAddress: string | null
  streetAddress2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
}

interface CheckoutClientProps {
  initialUser: User | null
  initialProfile: Profile | null
}

export function CheckoutClient({initialUser, initialProfile}: CheckoutClientProps) {
  const {cart, clearCart, mounted} = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Track page view (conditional based on success state)
  usePageName(successOrderNumber ? 'Order Confirmation' : 'Checkout')

  // Guest email (only for non-authenticated users)
  const [guestEmail, setGuestEmail] = useState('')

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    streetAddress: '',
    streetAddress2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })

  // Pre-fill shipping address from profile (names not stored in profile)
  useEffect(() => {
    if (initialProfile) {
      setShippingAddress((prev) => ({
        ...prev,
        streetAddress: initialProfile.streetAddress || '',
        streetAddress2: initialProfile.streetAddress2 || '',
        city: initialProfile.city || '',
        state: initialProfile.state || '',
        postalCode: initialProfile.postalCode || '',
        country: initialProfile.country || 'US',
      }))
    }
  }, [initialProfile])

  // Calculate shipping cost
  const shippingCost = useMemo(() => {
    // Free shipping for Exchange members
    if (initialUser && initialProfile?.isExchangeMember) {
      return 0
    }
    // $5 flat rate for everyone else
    return 500 // cents
  }, [initialUser, initialProfile])

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({...prev, [field]: value}))
    // Clear validation error for this field
    setValidationErrors((prev) => ({...prev, [field]: ''}))
  }

  const handleEmailChange = (email: string) => {
    setGuestEmail(email)
    setValidationErrors((prev) => ({...prev, guestEmail: ''}))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate guest email if not authenticated
    if (!initialUser) {
      if (!guestEmail) {
        errors.guestEmail = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(guestEmail)) {
          errors.guestEmail = 'Invalid email format'
        }
      }
    }

    // Validate shipping address
    if (!shippingAddress.firstName) {
      errors.firstName = 'First name is required'
    }
    if (!shippingAddress.lastName) {
      errors.lastName = 'Last name is required'
    }
    if (!shippingAddress.streetAddress) {
      errors.streetAddress = 'Street address is required'
    }
    if (!shippingAddress.city) {
      errors.city = 'City is required'
    }
    if (!shippingAddress.state) {
      errors.state = 'State is required'
    }
    if (!shippingAddress.postalCode) {
      errors.postalCode = 'Postal code is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!validateForm()) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Create order
      const result = await createOrder({
        formData: {
          guestEmail: initialUser ? undefined : guestEmail,
          shippingAddress,
        },
        cart,
        shippingCost,
        userId: initialUser?.id,
      })

      if (result.success && result.orderNumber) {
        // Clear cart
        clearCart()
        // Show success message
        setSuccessOrderNumber(result.orderNumber)
      } else {
        setError(result.error || 'Failed to create order')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Checkout error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success state
  if (successOrderNumber) {
    return (
      <div className="container mx-auto px-md py-xl max-w-4xl">
        <CheckoutSuccess orderNumber={successOrderNumber} />
      </div>
    )
  }

  // Show loading if not mounted (prevent hydration issues)
  if (!mounted) {
    return (
      <div className="container mx-auto px-md py-xl">
        <h1 className="text-4xl font-black tracking-tighter mb-xl">Checkout</h1>
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-md py-xl">
      <h1 className="text-4xl font-black tracking-tighter mb-xl">Checkout</h1>

      {error && (
        <div className="p-md bg-red-50 border border-error text-error mb-lg" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-xl">
            {/* Shipping Address */}
            <div className="p-lg border-2 border-border bg-background">
              <ShippingAddressForm
                address={shippingAddress}
                guestEmail={guestEmail}
                isGuest={!initialUser}
                errors={validationErrors}
                onAddressChange={handleAddressChange}
                onEmailChange={handleEmailChange}
              />
            </div>

            {/* Payment */}
            <div className="p-lg border-2 border-border bg-background">
              <PaymentForm />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-md space-y-md">
              <OrderSummary
                cart={cart}
                shippingCost={shippingCost}
                isMember={initialProfile?.isExchangeMember || false}
              />

              {/* Place Order Button */}
              <button
                type="submit"
                data-fs-element="place-order-button"
                disabled={isSubmitting || cart.lineItems.length === 0}
                className="w-full py-md px-lg bg-primary text-background border-2 border-primary text-base font-semibold transition-all duration-fast hover:bg-primary-dark hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 disabled:bg-disabled disabled:border-disabled disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
