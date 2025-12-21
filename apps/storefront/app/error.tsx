'use client'

import {useEffect} from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-md">
      <h2 className="text-3xl font-bold mb-md">Something went wrong</h2>
      <p className="text-text-muted mb-lg max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem
        persists.
      </p>
      <button
        onClick={() => reset()}
        className="bg-primary text-background px-lg py-sm border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast"
      >
        Try again
      </button>
    </div>
  )
}
