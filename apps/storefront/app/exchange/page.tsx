import type {Metadata} from 'next'

import {ClientAuthWrapper} from '@/lib/providers/ClientAuthWrapper'

import {ExchangeClient} from './ExchangeClient'

export const metadata: Metadata = {
  title: 'The Exchange',
  description: 'Access exclusive coffee drops and limited releases reserved for Exchange members.',
}

export default function ExchangePage() {
  return (
    <ClientAuthWrapper>
      <ExchangeClient />
    </ClientAuthWrapper>
  )
}
