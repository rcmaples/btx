'use client'

import type {User} from '@supabase/supabase-js'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'

import {type Profile, useAuth} from '@/lib/providers/AuthProvider'

interface ProfileClientProps {
  initialUser: User
  initialProfile: Profile | null
}

export function ProfileClient({initialUser, initialProfile}: ProfileClientProps) {
  const router = useRouter()
  const {updateProfile, signOut, cancelExchangeMembership} = useAuth()

  // Use initial data from server - no loading state needed
  const user = initialUser
  const profile = initialProfile

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Form state
  const [phone, setPhone] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [streetAddress2, setStreetAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('US')

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || '')
      setStreetAddress(profile.street_address || '')
      setStreetAddress2(profile.street_address_2 || '')
      setCity(profile.city || '')
      setState(profile.state || '')
      setPostalCode(profile.postal_code || '')
      setCountry(profile.country || 'US')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      const {error} = await updateProfile({
        phone: phone || null,
        street_address: streetAddress || null,
        street_address_2: streetAddress2 || null,
        city: city || null,
        state: state || null,
        postal_code: postalCode || null,
        country: country || 'US',
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Profile updated successfully')
        setIsEditing(false)
      }
    } catch {
      setError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleCancelMembership = async () => {
    setIsCancelling(true)
    setError(null)

    try {
      const {error} = await cancelExchangeMembership()
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Membership cancelled successfully')
        setShowCancelConfirm(false)
      }
    } catch {
      setError('Failed to cancel membership')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-xl">
        <h1 className="text-4xl font-black tracking-tighter">My Profile</h1>
        <button
          onClick={handleSignOut}
          className="text-text-secondary hover:text-error transition-colors"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="p-md bg-red-50 border border-error text-error mb-lg" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="p-md bg-green-50 border border-success text-success mb-lg" role="status">
          {success}
        </div>
      )}

      <div className="bg-background-secondary border-2 border-border p-xl">
        <div className="mb-lg pb-lg border-b border-border-light">
          <h2 className="font-bold mb-xs">Email</h2>
          <p className="text-text-secondary">{user.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-lg">
            <div>
              <label htmlFor="phone" className="block font-bold mb-xs">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <fieldset>
              <legend className="font-bold mb-md">Mailing Address</legend>

              <div className="space-y-md">
                <div>
                  <label htmlFor="streetAddress" className="block text-sm mb-xs">
                    Street Address
                  </label>
                  <input
                    id="streetAddress"
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="streetAddress2" className="block text-sm mb-xs">
                    Apt, Suite, Unit (Optional)
                  </label>
                  <input
                    id="streetAddress2"
                    type="text"
                    value={streetAddress2}
                    onChange={(e) => setStreetAddress2(e.target.value)}
                    className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label htmlFor="city" className="block text-sm mb-xs">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm mb-xs">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm mb-xs">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm mb-xs">
                      Country
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="flex gap-md">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-xl py-md border-2 border-border hover:border-text transition-colors font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-lg">
            <div>
              <h2 className="font-bold mb-xs">Phone</h2>
              <p className="text-text-secondary fs-mask">{profile?.phone || 'Not provided'}</p>
            </div>

            <div>
              <h2 className="font-bold mb-xs">Mailing Address</h2>
              {profile?.street_address ? (
                <address className="not-italic text-text-secondary fs-mask">
                  {profile.street_address}
                  {profile.street_address_2 && (
                    <>
                      <br />
                      {profile.street_address_2}
                    </>
                  )}
                  <br />
                  {profile.city}, {profile.state} {profile.postal_code}
                  <br />
                  {profile.country}
                </address>
              ) : (
                <p className="text-text-secondary">Not provided</p>
              )}
            </div>

            {/* Exchange Membership Section */}
            <div className="pt-lg border-t border-border-light">
              <h2 className="font-bold mb-sm">Exchange Membership</h2>

              {profile?.is_exchange_member ? (
                <div className="space-y-md">
                  <div className="p-md bg-green-50 border border-success">
                    <p className="font-bold text-success">Active Member</p>
                    <p className="text-sm text-text-secondary">
                      Member since{' '}
                      {profile.exchange_enrolled_at
                        ? new Date(profile.exchange_enrolled_at).toLocaleDateString()
                        : 'unknown'}
                    </p>
                  </div>

                  {showCancelConfirm ? (
                    <div className="p-md bg-yellow-50 border border-warning">
                      <p className="font-bold mb-sm">Are you sure you want to cancel?</p>
                      <p className="text-sm text-text-secondary mb-md">
                        You&apos;ll lose access to exclusive drops and member-only products. You can
                        rejoin anytime.
                      </p>
                      <div className="flex gap-sm">
                        <button
                          onClick={handleCancelMembership}
                          disabled={isCancelling}
                          className="px-md py-sm bg-error text-background border-2 border-error hover:bg-transparent hover:text-error transition-colors font-bold disabled:opacity-50"
                        >
                          {isCancelling ? 'Cancelling...' : 'Yes, Cancel Membership'}
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-md py-sm border-2 border-border hover:border-text transition-colors font-bold"
                        >
                          Keep Membership
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-sm text-text-secondary hover:text-error transition-colors"
                    >
                      Cancel Membership
                    </button>
                  )}
                </div>
              ) : profile?.exchange_cancelled_at ? (
                <div className="space-y-md">
                  <div className="p-md bg-background-alt border border-border">
                    <p className="text-text-secondary">
                      Membership cancelled on{' '}
                      {new Date(profile.exchange_cancelled_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href="/members" className="inline-block text-primary hover:underline">
                    Rejoin The Exchange
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-text-secondary mb-md">
                    You&apos;re not an Exchange member yet.
                  </p>
                  <Link href="/members" className="inline-block text-primary hover:underline">
                    Join The Exchange for exclusive access
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
