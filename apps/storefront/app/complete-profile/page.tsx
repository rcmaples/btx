import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

import {auth} from '@clerk/nextjs/server'

import {hasProfile} from '@/lib/prisma'

import {ProfileCompletionForm} from './ProfileCompletionForm'

export const metadata: Metadata = {
  title: 'Complete Your Profile',
  description: 'Complete your profile to start shopping at Batch Theory.',
}

/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with /
 */
function getSafeRedirectUrl(url: string | undefined): string {
  const defaultUrl = '/profile'
  if (!url) return defaultUrl

  // Only allow relative paths starting with /
  if (!url.startsWith('/')) return defaultUrl

  // Block protocol-relative URLs (//evil.com)
  if (url.startsWith('//')) return defaultUrl

  return url
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

  const params = await searchParams
  const redirectUrl = getSafeRedirectUrl(params.redirect_url)

  // If user already has a profile, redirect them
  const profileExists = await hasProfile(userId)
  if (profileExists) {
    redirect(redirectUrl)
  }

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
