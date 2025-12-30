import {auth, currentUser} from '@clerk/nextjs/server'

import {getProfile} from '@/lib/prisma'

import {CheckoutClient} from './CheckoutClient'

export default async function CheckoutPage() {
  const {userId} = await auth()

  let user = null
  let profile = null

  if (userId) {
    const clerkUser = await currentUser()
    user = {
      id: userId,
      email: clerkUser?.primaryEmailAddress?.emailAddress,
    }

    const prismaProfile = await getProfile(userId)
    if (prismaProfile) {
      profile = {
        isExchangeMember: prismaProfile.isExchangeMember,
        streetAddress: prismaProfile.streetAddress,
        streetAddress2: prismaProfile.streetAddress2,
        city: prismaProfile.city,
        state: prismaProfile.state,
        postalCode: prismaProfile.postalCode,
        country: prismaProfile.country,
      }
    }
  }

  return <CheckoutClient initialUser={user} initialProfile={profile} />
}
