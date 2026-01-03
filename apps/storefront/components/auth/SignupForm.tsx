'use client'

import {SignUp} from '@clerk/nextjs'
import Link from 'next/link'

export function SignupForm() {
  return (
    <div className="space-y-lg">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            // card: 'shadow-none border-2 bg-background',
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
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/complete-profile"
      />

      <p className="text-center text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
