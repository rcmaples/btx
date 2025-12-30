'use client'

import Link from 'next/link'

// LoginForm stubbed during Supabase removal
// Will be replaced with Clerk SignIn component in Phase 2
export function LoginForm() {
  return (
    <div className="space-y-lg">
      <div className="p-md bg-yellow-50 border border-warning text-warning-dark" role="alert">
        Authentication is being upgraded. Sign in will be available soon.
      </div>

      <p className="text-center text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
