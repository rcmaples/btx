'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {FSFormField, FSSelect, US_STATES} from '@/components/fs'
import {Alert, Button} from '@/components/ui'
import {createProfile, type ProfileFormData} from '@/lib/actions/profile'

type Props = {
  redirectUrl: string
}

export function ProfileCompletionForm({redirectUrl}: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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

    const result = await createProfile(data)

    if (result.success) {
      router.push(redirectUrl)
    } else {
      setError(result.error || 'Failed to create profile')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      {error && <Alert variant="error">{error}</Alert>}

      <FSFormField
        label="Phone Number"
        type="tel"
        id="phone"
        name="phone"
        placeholder="(555) 555-5555"
        optional
        privacy="mask"
      />

      <FSFormField
        label="Street Address"
        type="text"
        id="streetAddress"
        name="streetAddress"
        required
        placeholder="123 Main St"
        privacy="mask"
      />

      <FSFormField
        label="Apartment, Suite, etc."
        type="text"
        id="streetAddress2"
        name="streetAddress2"
        placeholder="Apt 4B"
        optional
        privacy="mask"
      />

      <div className="grid grid-cols-2 gap-md">
        <FSFormField
          label="City"
          type="text"
          id="city"
          name="city"
          required
          placeholder="City"
          privacy="mask"
        />

        <FSSelect
          label="State"
          id="state"
          name="state"
          required
          options={US_STATES}
          placeholder="Select state"
          privacy="mask"
        />
      </div>

      <FSFormField
        label="Postal Code"
        type="text"
        id="postalCode"
        name="postalCode"
        required
        pattern="[0-9]{5}(-[0-9]{4})?"
        placeholder="12345"
        privacy="mask"
      />

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? 'Creating Profile...' : 'Complete Profile'}
      </Button>
    </form>
  )
}
