'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useMemo, useState} from 'react'

import {CheckoutSuccess} from '@/components/checkout/CheckoutSuccess'
import {OrderSummary} from '@/components/checkout/OrderSummary'
import {PaymentForm} from '@/components/checkout/PaymentForm'
import {ShippingAddressForm} from '@/components/checkout/ShippingAddressForm'
import {usePageProperties} from '@/lib/fullstory/hooks'
import {centsToReal, trackCheckoutFormSubmitted, trackOrderCompleted} from '@/lib/fullstory/utils'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const {cart, clearCart, mounted} = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Check if we're on the confirmation page via URL
  const isConfirmed = searchParams.get('confirmed') === 'true'
  const orderFromUrl = searchParams.get('order')

  // Redirect if confirmed=true but no order number in URL or state
  useEffect(() => {
    if (isConfirmed && !orderFromUrl && !successOrderNumber) {
      router.replace('/')
    }
  }, [isConfirmed, orderFromUrl, successOrderNumber, router])

  // Calculate shipping cost
  const shippingCost = useMemo(() => {
    // Free shipping for Exchange members
    if (initialUser && initialProfile?.isExchangeMember) {
      return 0
    }
    // $5 flat rate for everyone else
    return 500 // cents
  }, [initialUser, initialProfile])

  // Set page-level checkout context (proper data scoping)
  // Cart context is available for all analytics queries on this page view
  // Note: pageName can only be set ONCE per URL in FullStory, so we use URL params
  // to differentiate checkout from confirmation (triggers page property reset)
  const showConfirmation = successOrderNumber || isConfirmed
  const pageProperties = useMemo(
    () => ({
      pageName: showConfirmation ? 'Order Confirmation' : 'Checkout',
      cartValue: centsToReal(cart.total),
      itemCount: cart.lineItems.reduce((sum, item) => sum + item.quantity, 0),
      hasPromotion: cart.appliedPromotion !== null,
      promotionCode: cart.appliedPromotion?.code,
      shippingCost: centsToReal(shippingCost),
      isMember: initialProfile?.isExchangeMember ?? false,
    }),
    [showConfirmation, cart, shippingCost, initialProfile],
  )
  usePageProperties(pageProperties)

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

    // Track form submission BEFORE server call to signal intentional submission
    // This prevents FullStory from marking the form as abandoned when it disappears
    trackCheckoutFormSubmitted({
      checkout_step: 'order_placement',
      has_guest_email: !initialUser,
      shipping_country: shippingAddress.country,
    })

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
        // Track order completion (cart context inherited from page properties)
        trackOrderCompleted({
          order_id: result.orderNumber,
          revenue: centsToReal(cart.total + shippingCost),
          shipping: centsToReal(shippingCost),
          currency: 'USD',
        })
        // Clear cart
        clearCart()
        // Show success message
        setSuccessOrderNumber(result.orderNumber)
        // Update URL to trigger new page in FullStory (pageName can only be set once per URL)
        router.replace(`/checkout?confirmed=true&order=${result.orderNumber}`)
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

  // Show success state (from state or URL)
  if (showConfirmation) {
    const displayOrderNumber = successOrderNumber || orderFromUrl || ''
    return (
      <div className="container mx-auto px-md py-xl max-w-4xl">
        <CheckoutSuccess orderNumber={displayOrderNumber} />
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
