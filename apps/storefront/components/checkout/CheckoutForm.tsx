'use client'

import {useState} from 'react'

import {FSFormField} from '@/components/fs/FSFormField'
import {Alert, Button} from '@/components/ui'

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

      <Alert variant="warning">
        <strong>Test Mode:</strong> Use any information. No real data will be stored or transmitted.
      </Alert>

      <FSFormField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        disabled={isSubmitting}
        placeholder="you@example.com"
        error={errors.email}
        privacy="mask"
      />

      <FSFormField
        label="Full Name"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        disabled={isSubmitting}
        placeholder="John Doe"
        error={errors.fullName}
        privacy="mask"
      />

      <FSFormField
        label="Address"
        type="text"
        name="addressLine1"
        value={formData.addressLine1}
        onChange={handleChange}
        disabled={isSubmitting}
        placeholder="123 Main St"
        error={errors.addressLine1}
        privacy="mask"
      />

      <div className="grid grid-cols-3 gap-md">
        <FSFormField
          label="City"
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="San Francisco"
          error={errors.city}
          privacy="mask"
        />

        <FSFormField
          label="State"
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="CA"
          maxLength={2}
          error={errors.state}
          privacy="mask"
        />

        <FSFormField
          label="ZIP Code"
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="94102"
          error={errors.zipCode}
          privacy="mask"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  )
}
