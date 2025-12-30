'use client'

import Link from 'next/link'

// SignupForm stubbed during Supabase removal
// Will be replaced with Clerk SignUp component in Phase 2
export function SignupForm() {
  return (
    <div className="space-y-lg">
      <div className="p-md bg-yellow-50 border border-warning text-warning-dark" role="alert">
        Authentication is being upgraded. Sign up will be available soon.
      </div>

      <p className="text-center text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
