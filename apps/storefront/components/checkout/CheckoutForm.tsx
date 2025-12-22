'use client'

import {useState} from 'react'

export interface CheckoutFormData {
  email: string
  fullName: string
  addressLine1: string
  city: string
  state: string
  zipCode: string
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  isSubmitting: boolean
}

export function CheckoutForm({onSubmit, isSubmitting}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setFormData((prev) => ({...prev, [name]: value}))

    // Clear error when user starts typing
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({...prev, [name]: undefined}))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.addressLine1) {
      newErrors.addressLine1 = 'Address is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    if (!formData.zipCode) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      <h2 className="text-2xl font-bold mb-lg">Shipping Information</h2>

      <p className="p-md bg-warning-light border border-warning text-sm">
        <strong>Test Mode:</strong> Use any information. No real data will be stored or transmitted.
      </p>

      <div className="space-y-md">
        <label htmlFor="email" className="block text-sm font-medium mb-xs">
          Email Address <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-sm border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
          disabled={isSubmitting}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-sm text-danger mt-xs">{errors.email}</p>}
      </div>

      <div className="space-y-md">
        <label htmlFor="fullName" className="block text-sm font-medium mb-xs">
          Full Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-sm border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
          disabled={isSubmitting}
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-sm text-danger mt-xs">{errors.fullName}</p>}
      </div>

      <div className="space-y-md">
        <label htmlFor="addressLine1" className="block text-sm font-medium mb-xs">
          Address <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className="w-full p-sm border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
          disabled={isSubmitting}
          placeholder="123 Main St"
        />
        {errors.addressLine1 && <p className="text-sm text-danger mt-xs">{errors.addressLine1}</p>}
      </div>

      <div className="grid grid-cols-3 gap-md">
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-xs">
            City <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-sm border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
            disabled={isSubmitting}
            placeholder="San Francisco"
          />
          {errors.city && <p className="text-sm text-danger mt-xs">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-xs">
            State <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full p-sm border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
            disabled={isSubmitting}
            placeholder="CA"
            maxLength={2}
          />
          {errors.state && <p className="text-sm text-danger mt-xs">{errors.state}</p>}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-xs">
            ZIP Code <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full p-sm border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
            disabled={isSubmitting}
            placeholder="94102"
          />
          {errors.zipCode && <p className="text-sm text-danger mt-xs">{errors.zipCode}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-md px-lg bg-primary text-background border-2 border-primary text-base font-semibold cursor-pointer transition-all duration-fast hover:bg-primary-dark hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 disabled:bg-disabled disabled:border-disabled disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  )
}
