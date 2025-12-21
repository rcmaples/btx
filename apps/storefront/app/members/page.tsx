import type {Metadata} from 'next'

import {MembershipClient} from './MembershipClient'

export const metadata: Metadata = {
  title: 'Join The Exchange',
  description:
    'Join The Exchange membership for exclusive access to limited-edition coffees and member benefits.',
}

export default function MembershipPage() {
  return <MembershipClient />
}
