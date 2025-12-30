import type {Metadata} from 'next'

import {ExchangeClient} from './ExchangeClient'

export const metadata: Metadata = {
  title: 'The Exchange',
  description: 'Access exclusive coffee drops and limited releases reserved for Exchange members.',
}

export default function ExchangePage() {
  return <ExchangeClient />
}
