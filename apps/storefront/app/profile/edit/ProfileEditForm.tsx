'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {updateProfile, type ProfileFormData} from '@/lib/actions/profile'

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

type Profile = {
  id: string
  phone: string | null
  streetAddress: string | null
  streetAddress2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string
}

type Props = {
  profile: Profile
}

export function ProfileEditForm({profile}: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    const data: ProfileFormData = {
      phone: (formData.get('phone') as string) || undefined,
      streetAddress: formData.get('streetAddress') as string,
      streetAddress2: (formData.get('streetAddress2') as string) || undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: 'US',
    }

    const result = await updateProfile(data)

    if (result.success) {
      setSuccess(true)
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } else {
      setError(result.error || 'Failed to update profile')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      {error && (
        <div className="p-md bg-red-50 border border-error text-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="p-md bg-green-50 border border-success text-success" role="status">
          Profile updated successfully! Redirecting...
        </div>
      )}

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-text mb-xs">
          Phone Number <span className="text-text-secondary">(optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          defaultValue={profile.phone || ''}
          className="w-full px-md py-sm border-2 border-border focus:border-primary focus:outline-none bg-background text-text"
          placeholder="(555) 555-5555"
        />
      </div>

      <div>
        <label htmlFor="streetAddress" className="block text-sm font-medium text-text mb-xs">
          Street Address <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          defaultValue={profile.streetAddress || ''}
          required
          className="w-full px-md py-sm border-2 border-border focus:border-primary focus:outline-none bg-background text-text"
          placeholder="123 Main St"
        />
      </div>

      <div>
        <label htmlFor="streetAddress2" className="block text-sm font-medium text-text mb-xs">
          Apartment, Suite, etc. <span className="text-text-secondary">(optional)</span>
        </label>
        <input
          type="text"
          id="streetAddress2"
          name="streetAddress2"
          defaultValue={profile.streetAddress2 || ''}
          className="w-full px-md py-sm border-2 border-border focus:border-primary focus:outline-none bg-background text-text"
          placeholder="Apt 4B"
        />
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-text mb-xs">
            City <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={profile.city || ''}
            required
            className="w-full px-md py-sm border-2 border-border focus:border-primary focus:outline-none bg-background text-text"
            placeholder="City"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-text mb-xs">
            State <span className="text-error">*</span>
          </label>
          <select
            id="state"
            name="state"
            defaultValue={profile.state || ''}
            required
            className="w-full px-md py-sm border-2 border-border focus:border-primary focus:outline-none bg-background text-text"
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-text mb-xs">
          Postal Code <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          defaultValue={profile.postalCode || ''}
          required
          pattern="[0-9]{5}(-[0-9]{4})?"
          className="w-full px-md py-sm border-2 border-border focus:border-primary focus:outline-none bg-background text-text"
          placeholder="12345"
        />
      </div>

      <div className="flex gap-md">
        <Link
          href="/profile"
          className="flex-1 text-center bg-background text-text font-bold py-md px-lg border-2 border-border hover:bg-background-secondary transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading || success}
          className="flex-1 bg-primary text-background font-bold py-md px-lg border-2 border-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
