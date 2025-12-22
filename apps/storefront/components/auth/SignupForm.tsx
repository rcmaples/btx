'use client'

import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

import {useAuth} from '@/lib/providers/AuthProvider'

export function SignupForm() {
  const router = useRouter()
  const {signUp} = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const {error} = await signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        router.push('/profile')
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
          minLength={8}
          className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          placeholder="Minimum 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block font-bold mb-xs">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-md py-sm border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          placeholder="Repeat your password"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-background px-xl py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-fast font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-center text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
