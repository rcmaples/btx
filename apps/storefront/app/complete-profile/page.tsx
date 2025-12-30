import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

import {auth} from '@clerk/nextjs/server'

import {hasProfile} from '@/lib/prisma'

import {ProfileCompletionForm} from './ProfileCompletionForm'

export const metadata: Metadata = {
  title: 'Complete Your Profile',
  description: 'Complete your profile to start shopping at Batch Theory.',
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{redirect_url?: string}>
}) {
  const {userId} = await auth()

  // Redirect unauthenticated users to login
  if (!userId) {
    redirect('/login')
  }

  // If user already has a profile, redirect them
  const profileExists = await hasProfile(userId)
  if (profileExists) {
    const params = await searchParams
    redirect(params.redirect_url || '/profile')
  }

  const params = await searchParams
  const redirectUrl = params.redirect_url || '/profile'

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-xl">
        <h1 className="text-4xl font-black tracking-tighter mb-sm">Complete Your Profile</h1>
        <p className="text-text-secondary">
          Add your shipping address to complete your account setup
        </p>
      </div>
      <ProfileCompletionForm redirectUrl={redirectUrl} />
    </div>
  )
}
