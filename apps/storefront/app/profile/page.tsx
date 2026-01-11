import {auth, currentUser} from '@clerk/nextjs/server'
import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

import {FSPageName} from '@/components/common/FSPageName'
import {getProfile} from '@/lib/prisma'

import {ExchangeMembershipSection} from './ExchangeMembershipSection'

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
    <div className="max-w-4xl mx-auto">
      <FSPageName pageName="Profile" />
      <div className="flex items-center justify-between mb-lg">
        <h1 className="text-3xl font-black tracking-tighter leading-none m-0">My Profile</h1>
        <a
          href="/profile/edit"
          className="px-md py-sm text-sm leading-none bg-primary text-background border-2 border-primary font-semibold transition-colors hover:bg-primary-dark hover:border-primary-dark"
        >
          Edit Profile
        </a>
      </div>

      {/* Single unified card with sections */}
      <div className="bg-background-secondary border-2 border-border">
        {/* Account & Shipping - side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-border">
          {/* Account Info */}
          <section className="px-lg py-md md:py-lg">
            <h2 className="text-base font-bold uppercase tracking-wider text-text mb-sm">
              Account
            </h2>
            <div className="space-y-md">
              {(user?.firstName || user?.lastName) && (
                <div>
                  <span className="text-text-secondary font-bold mb-xs text-sm">Name</span>
                  <div className="text-text font-medium text-sm">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
                  </div>
                </div>
              )}
              <div>
                <span className="text-text-secondary font-bold mb-xs text-sm">Email</span>
                <div className="fs-mask text-text font-medium text-sm">
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
              {profile.phone && (
                <div>
                  <span className="text-text-secondary font-bold mb-xs text-xs">Phone</span>
                  <p className="fs-mask text-text font-medium text-sm">{profile.phone}</p>
                </div>
              )}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="px-lg pb-md md:pb-lg">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-sm">
              Shipping Address
            </h2>
            <address className="fs-mask not-italic text-text text-sm leading-tight">
              <div>{profile.streetAddress}</div>
              {profile.streetAddress2 && <div>{profile.streetAddress2}</div>}
              <div>
                {profile.city}, {profile.state} {profile.postalCode}
              </div>
              <div>{profile.country}</div>
            </address>
          </section>
        </div>

        {/* Exchange Membership - full width at bottom */}
        <div className="border-t-2 border-border">
          <ExchangeMembershipSection
            isExchangeMember={profile.isExchangeMember}
            exchangeEnrolledAt={profile.exchangeEnrolledAt}
          />
        </div>
      </div>
    </div>
  )
}
