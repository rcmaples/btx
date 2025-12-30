'use client'

import type {ShippingAddress} from '@/lib/types/checkout'

const US_STATES = [
  {value: 'AL', label: 'Alabama'},
  {value: 'AK', label: 'Alaska'},
  {value: 'AZ', label: 'Arizona'},
  {value: 'AR', label: 'Arkansas'},
  {value: 'CA', label: 'California'},
  {value: 'CO', label: 'Colorado'},
  {value: 'CT', label: 'Connecticut'},
  {value: 'DE', label: 'Delaware'},
  {value: 'FL', label: 'Florida'},
  {value: 'GA', label: 'Georgia'},
  {value: 'HI', label: 'Hawaii'},
  {value: 'ID', label: 'Idaho'},
  {value: 'IL', label: 'Illinois'},
  {value: 'IN', label: 'Indiana'},
  {value: 'IA', label: 'Iowa'},
  {value: 'KS', label: 'Kansas'},
  {value: 'KY', label: 'Kentucky'},
  {value: 'LA', label: 'Louisiana'},
  {value: 'ME', label: 'Maine'},
  {value: 'MD', label: 'Maryland'},
  {value: 'MA', label: 'Massachusetts'},
  {value: 'MI', label: 'Michigan'},
  {value: 'MN', label: 'Minnesota'},
  {value: 'MS', label: 'Mississippi'},
  {value: 'MO', label: 'Missouri'},
  {value: 'MT', label: 'Montana'},
  {value: 'NE', label: 'Nebraska'},
  {value: 'NV', label: 'Nevada'},
  {value: 'NH', label: 'New Hampshire'},
  {value: 'NJ', label: 'New Jersey'},
  {value: 'NM', label: 'New Mexico'},
  {value: 'NY', label: 'New York'},
  {value: 'NC', label: 'North Carolina'},
  {value: 'ND', label: 'North Dakota'},
  {value: 'OH', label: 'Ohio'},
  {value: 'OK', label: 'Oklahoma'},
  {value: 'OR', label: 'Oregon'},
  {value: 'PA', label: 'Pennsylvania'},
  {value: 'RI', label: 'Rhode Island'},
  {value: 'SC', label: 'South Carolina'},
  {value: 'SD', label: 'South Dakota'},
  {value: 'TN', label: 'Tennessee'},
  {value: 'TX', label: 'Texas'},
  {value: 'UT', label: 'Utah'},
  {value: 'VT', label: 'Vermont'},
  {value: 'VA', label: 'Virginia'},
  {value: 'WA', label: 'Washington'},
  {value: 'WV', label: 'West Virginia'},
  {value: 'WI', label: 'Wisconsin'},
  {value: 'WY', label: 'Wyoming'},
  {value: 'DC', label: 'District of Columbia'},
]

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
          <label htmlFor="email" className="block text-sm font-medium text-text mb-xs">
            Email Address <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={guestEmail || ''}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
            placeholder="you@example.com"
            required
          />
          {errors.guestEmail && <p className="text-sm text-error mt-xs">{errors.guestEmail}</p>}
        </div>
      )}

      {/* First and Last Name */}
      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text mb-xs">
            First Name <span className="text-error">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={address.firstName}
            onChange={(e) => onAddressChange('firstName', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
            placeholder="John"
            required
          />
          {errors.firstName && <p className="text-sm text-error mt-xs">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text mb-xs">
            Last Name <span className="text-error">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={address.lastName}
            onChange={(e) => onAddressChange('lastName', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
            placeholder="Doe"
            required
          />
          {errors.lastName && <p className="text-sm text-error mt-xs">{errors.lastName}</p>}
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="streetAddress" className="block text-sm font-medium text-text mb-xs">
          Street Address <span className="text-error">*</span>
        </label>
        <input
          id="streetAddress"
          type="text"
          value={address.streetAddress}
          onChange={(e) => onAddressChange('streetAddress', e.target.value)}
          className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
          placeholder="123 Main St"
          required
        />
        {errors.streetAddress && <p className="text-sm text-error mt-xs">{errors.streetAddress}</p>}
      </div>

      {/* Apt/Suite/Unit */}
      <div>
        <label htmlFor="streetAddress2" className="block text-sm font-medium text-text mb-xs">
          Apartment, Suite, etc. <span className="text-text-secondary">(optional)</span>
        </label>
        <input
          id="streetAddress2"
          type="text"
          value={address.streetAddress2 || ''}
          onChange={(e) => onAddressChange('streetAddress2', e.target.value)}
          className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
          placeholder="Apt 4B"
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-text mb-xs">
            City <span className="text-error">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
            placeholder="City"
            required
          />
          {errors.city && <p className="text-sm text-error mt-xs">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-text mb-xs">
            State <span className="text-error">*</span>
          </label>
          <select
            id="state"
            value={address.state}
            onChange={(e) => onAddressChange('state', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-sm text-error mt-xs">{errors.state}</p>}
        </div>
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-text mb-xs">
            Postal Code <span className="text-error">*</span>
          </label>
          <input
            id="postalCode"
            type="text"
            value={address.postalCode}
            onChange={(e) => onAddressChange('postalCode', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
            placeholder="12345"
            pattern="[0-9]{5}(-[0-9]{4})?"
            required
          />
          {errors.postalCode && <p className="text-sm text-error mt-xs">{errors.postalCode}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-text mb-xs">
            Country <span className="text-error">*</span>
          </label>
          <select
            id="country"
            value={address.country}
            onChange={(e) => onAddressChange('country', e.target.value)}
            className="w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors"
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
