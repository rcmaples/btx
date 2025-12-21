import type {Metadata} from 'next'

import {getProducts} from '@/lib/services/sanity/queries'

import {ExchangeClient} from './ExchangeClient'

export const metadata: Metadata = {
  title: 'The Exchange',
  description: 'Access exclusive coffee drops and limited releases reserved for Exchange members.',
}

export default async function ExchangePage() {
  // Fetch exclusive products on the server
  const allProducts = await getProducts({isMember: true})
  const exclusiveProducts = allProducts.filter((p) => p.isExclusiveDrop)

  return <ExchangeClient exclusiveProducts={exclusiveProducts} />
}
