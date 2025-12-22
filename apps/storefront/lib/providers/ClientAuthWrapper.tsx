'use client'

import type {ReactNode} from 'react'
import {Suspense} from 'react'

import {AuthProvider} from './AuthProvider'

export function ClientAuthWrapper({children}: {children: ReactNode}) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  )
}
