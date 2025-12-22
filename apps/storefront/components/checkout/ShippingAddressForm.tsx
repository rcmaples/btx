'use client'

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
        <div>
          <label htmlFor="email" className="block font-bold mb-xs">
            Email Address <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={guestEmail || ''}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            placeholder="you@example.com"
            required
          />
          {errors.guestEmail && <p className="text-sm text-error mt-xs">{errors.guestEmail}</p>}
        </div>
      )}

      {/* Street Address */}
      <div>
        <label htmlFor="streetAddress" className="block font-bold mb-xs">
          Street Address <span className="text-error">*</span>
        </label>
        <input
          id="streetAddress"
          type="text"
          value={address.streetAddress}
          onChange={(e) => onAddressChange('streetAddress', e.target.value)}
          className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          required
        />
        {errors.streetAddress && <p className="text-sm text-error mt-xs">{errors.streetAddress}</p>}
      </div>

      {/* Apt/Suite/Unit */}
      <div>
        <label htmlFor="streetAddress2" className="block font-bold mb-xs">
          Apt, Suite, Unit (Optional)
        </label>
        <input
          id="streetAddress2"
          type="text"
          value={address.streetAddress2 || ''}
          onChange={(e) => onAddressChange('streetAddress2', e.target.value)}
          className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor="city" className="block font-bold mb-xs">
            City <span className="text-error">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            required
          />
          {errors.city && <p className="text-sm text-error mt-xs">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block font-bold mb-xs">
            State <span className="text-error">*</span>
          </label>
          <input
            id="state"
            type="text"
            value={address.state}
            onChange={(e) => onAddressChange('state', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            placeholder="CA"
            required
          />
          {errors.state && <p className="text-sm text-error mt-xs">{errors.state}</p>}
        </div>
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor="postalCode" className="block font-bold mb-xs">
            Postal Code <span className="text-error">*</span>
          </label>
          <input
            id="postalCode"
            type="text"
            value={address.postalCode}
            onChange={(e) => onAddressChange('postalCode', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            required
          />
          {errors.postalCode && <p className="text-sm text-error mt-xs">{errors.postalCode}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block font-bold mb-xs">
            Country <span className="text-error">*</span>
          </label>
          <select
            id="country"
            value={address.country}
            onChange={(e) => onAddressChange('country', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>
    </div>
  )
}
