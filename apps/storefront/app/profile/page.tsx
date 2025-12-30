import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

import {auth, currentUser} from '@clerk/nextjs/server'

import {getProfile} from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and edit your Batch Theory profile.',
}

export default async function ProfilePage() {
  const {userId} = await auth()

  // Middleware handles unauthenticated users, but this is a safety check
  if (!userId) {
    redirect('/login')
  }

  // Check if user has a profile
  const profile = await getProfile(userId)

  // If no profile, redirect to complete profile page
  if (!profile) {
    redirect('/complete-profile')
  }

  // Get user details from Clerk
  const user = await currentUser()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-black tracking-tighter mb-xl">My Profile</h1>

      <div className="space-y-lg">
        {/* Account Info */}
        <section className="bg-background-secondary border-2 border-border p-xl">
          <h2 className="text-xl font-bold mb-lg">Account</h2>
          <div className="space-y-md">
            <div>
              <span className="text-text-secondary text-sm">Email</span>
              <p className="text-text font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            {profile.phone && (
              <div>
                <span className="text-text-secondary text-sm">Phone</span>
                <p className="text-text font-medium">{profile.phone}</p>
              </div>
            )}
          </div>
        </section>

        {/* Shipping Address */}
        <section className="bg-background-secondary border-2 border-border p-xl">
          <h2 className="text-xl font-bold mb-lg">Shipping Address</h2>
          <address className="not-italic text-text">
            <p>{profile.streetAddress}</p>
            {profile.streetAddress2 && <p>{profile.streetAddress2}</p>}
            <p>
              {profile.city}, {profile.state} {profile.postalCode}
            </p>
            <p>{profile.country}</p>
          </address>
        </section>

        {/* Exchange Membership */}
        <section className="bg-background-secondary border-2 border-border p-xl">
          <h2 className="text-xl font-bold mb-lg">Exchange Membership</h2>
          {profile.isExchangeMember ? (
            <div>
              <p className="text-success font-medium">Active Member</p>
              {profile.exchangeEnrolledAt && (
                <p className="text-text-secondary text-sm">
                  Member since {new Date(profile.exchangeEnrolledAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-text-secondary">Not an Exchange member</p>
          )}
        </section>
      </div>
    </div>
  )
}
