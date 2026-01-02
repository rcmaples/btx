import type {Metadata} from 'next'
import {Suspense} from 'react'

import {LoginForm} from '@/components/auth/LoginForm'
import {FSPageName} from '@/components/common/FSPageName'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Batch Theory account.',
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <FSPageName pageName="Sign In" />
      <div className="text-center mb-xl">
        <h1 className="text-4xl font-black tracking-tighter mb-sm">Sign In</h1>
        <p className="text-text-secondary">Welcome back to Batch Theory</p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
