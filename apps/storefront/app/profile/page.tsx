import type {Metadata} from 'next'
import {redirect} from 'next/navigation'
import {getServerAuth} from '@/lib/supabase/server'
import {ClientAuthWrapper} from '@/lib/providers/ClientAuthWrapper'
import {ProfileClient} from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and edit your Batch Theory profile.',
}

export default async function ProfilePage() {
  // Server-side auth check - instant, reads from cookie
  const {supabase, user} = await getServerAuth()

  if (!user) {
    redirect('/login?redirect=/profile')
  }

  // Fetch profile server-side - fast
  const {data: profile} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <ClientAuthWrapper>
      <ProfileClient initialUser={user} initialProfile={profile} />
    </ClientAuthWrapper>
  )
}
