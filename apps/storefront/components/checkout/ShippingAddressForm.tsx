'use client'

import {COUNTRIES, FSFormField, FSSelect, US_STATES} from '@/components/fs'
import type {ShippingAddress} from '@/lib/types/checkout'

interface ShippingAddressFormProps {
  address: ShippingAddress
  guestEmail?: string
  isGuest: boolean
  errors: Record<string, string>
  onAddressChange: (field: keyof ShippingAddress, value: string) => void
  onEmailChange?: (email: string) => void
}

export function ShippingAddressForm({
  address,
  guestEmail,
  isGuest,
  errors,
  onAddressChange,
  onEmailChange,
}: ShippingAddressFormProps) {
  return (
    <div className="space-y-lg">
      <h2 className="text-xl font-bold">Shipping Information</h2>

      {/* Guest Email */}
      {isGuest && onEmailChange && (
        <FSFormField
          label="Email Address"
          type="email"
          value={guestEmail || ''}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          error={errors.guestEmail}
          required
        />
      )}

      {/* First and Last Name */}
      <div className="grid grid-cols-2 gap-md">
        <FSFormField
          label="First Name"
          type="text"
          value={address.firstName}
          onChange={(e) => onAddressChange('firstName', e.target.value)}
          placeholder="John"
          error={errors.firstName}
          required
        />
        <FSFormField
          label="Last Name"
          type="text"
          value={address.lastName}
          onChange={(e) => onAddressChange('lastName', e.target.value)}
          placeholder="Doe"
          error={errors.lastName}
          required
        />
      </div>

      {/* Street Address */}
      <FSFormField
        label="Street Address"
        type="text"
        value={address.streetAddress}
        onChange={(e) => onAddressChange('streetAddress', e.target.value)}
        placeholder="123 Main St"
        error={errors.streetAddress}
        required
      />

      {/* Apt/Suite/Unit */}
      <FSFormField
        label="Apartment, Suite, etc."
        type="text"
        value={address.streetAddress2 || ''}
        onChange={(e) => onAddressChange('streetAddress2', e.target.value)}
        placeholder="Apt 4B"
        optional
      />

      {/* City and State */}
      <div className="grid grid-cols-2 gap-md">
        <FSFormField
          label="City"
          type="text"
          value={address.city}
          onChange={(e) => onAddressChange('city', e.target.value)}
          placeholder="City"
          error={errors.city}
          required
        />
        <FSSelect
          label="State"
          options={[...US_STATES]}
          value={address.state}
          onChange={(e) => onAddressChange('state', e.target.value)}
          placeholder="Select state"
          error={errors.state}
          required
        />
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-2 gap-md">
        <FSFormField
          label="Postal Code"
          type="text"
          value={address.postalCode}
          onChange={(e) => onAddressChange('postalCode', e.target.value)}
          placeholder="12345"
          pattern="[0-9]{5}(-[0-9]{4})?"
          error={errors.postalCode}
          required
        />
        <FSSelect
          label="Country"
          options={[...COUNTRIES]}
          value={address.country}
          onChange={(e) => onAddressChange('country', e.target.value)}
          required
        />
      </div>
    </div>
  )
}
