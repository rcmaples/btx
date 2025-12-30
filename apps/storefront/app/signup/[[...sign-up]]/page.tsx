import type {Metadata} from 'next'

import {SignupForm} from '@/components/auth/SignupForm'
import {FSPageName} from '@/components/common/FSPageName'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Batch Theory account to start shopping for coffee with intention.',
}

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto">
      <FSPageName pageName="Sign up" />
      <div className="text-center mb-xl">
        <h1 className="text-4xl font-black tracking-tighter mb-sm">Create Account</h1>
        <p className="text-text-secondary">Join Batch Theory for intentional coffee</p>
      </div>
      <SignupForm />
    </div>
  )
}
