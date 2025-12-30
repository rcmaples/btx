import type {Metadata} from 'next'
import {redirect} from 'next/navigation'

import {auth} from '@clerk/nextjs/server'

import {getProfile} from '@/lib/prisma'

import {ProfileEditForm} from './ProfileEditForm'

export const metadata: Metadata = {
  title: 'Edit Profile',
  description: 'Update your Batch Theory profile information.',
}

export default async function ProfileEditPage() {
  const {userId} = await auth()

  if (!userId) {
    redirect('/login')
  }

  const profile = await getProfile(userId)

  if (!profile) {
    redirect('/complete-profile')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-black tracking-tighter mb-xl">Edit Profile</h1>
      <ProfileEditForm profile={profile} />
    </div>
  )
}
