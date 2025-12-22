'use client'

import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'

import {useAuth} from '@/lib/providers/AuthProvider'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {signIn} = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/profile'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const {error} = await signIn(email, password)

      if (error) {
        setError(error.message)
      } else {
        router.push(redirectTo)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      {error && (
        <div className="p-md bg-red-50 border border-error text-error" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block font-bold mb-xs">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block font-bold mb-xs">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <p className="text-center text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}
