'use client'

import {SignIn} from '@clerk/nextjs'
import Link from 'next/link'

export function LoginForm() {
  return (
    <div className="space-y-lg">
      <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              // card: 'shadow-none border-2 border-border bg-background',
              headerTitle: 'text-text font-black',
              headerSubtitle: 'text-text-secondary',
              socialButtonsBlockButton:
                'border-2 border-border text-text hover:bg-background-secondary transition-colors',
              formFieldLabel: 'text-text font-medium',
              formFieldInput:
                'border-2 border-border focus:border-primary focus:ring-0 bg-background text-text',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-background font-bold',
              footerActionLink: 'text-primary font-bold hover:text-primary/80',
              identifierPreviewEditButton: 'text-primary',
            },
          }}
          routing="path"
          path="/login"
          signUpUrl="/signup"
          fallbackRedirectUrl="/profile"
        />

      <p className="text-center text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
