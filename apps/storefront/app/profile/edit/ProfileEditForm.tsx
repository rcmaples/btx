'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {FSFormField, FSSelect, US_STATES} from '@/components/fs'
import {type ProfileFormData, updateProfile} from '@/lib/actions/profile'

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

      <FSFormField
        label="Phone Number"
        type="tel"
        name="phone"
        defaultValue={profile.phone || ''}
        placeholder="(555) 555-5555"
        optional
      />

      <FSFormField
        label="Street Address"
        type="text"
        name="streetAddress"
        defaultValue={profile.streetAddress || ''}
        placeholder="123 Main St"
        required
      />

      <FSFormField
        label="Apartment, Suite, etc."
        type="text"
        name="streetAddress2"
        defaultValue={profile.streetAddress2 || ''}
        placeholder="Apt 4B"
        optional
      />

      <div className="grid grid-cols-2 gap-md">
        <FSFormField
          label="City"
          type="text"
          name="city"
          defaultValue={profile.city || ''}
          placeholder="City"
          required
        />
        <FSSelect
          label="State"
          name="state"
          options={[...US_STATES]}
          defaultValue={profile.state || ''}
          placeholder="Select state"
          required
        />
      </div>

      <FSFormField
        label="Postal Code"
        type="text"
        name="postalCode"
        defaultValue={profile.postalCode || ''}
        placeholder="12345"
        pattern="[0-9]{5}(-[0-9]{4})?"
        required
      />

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
