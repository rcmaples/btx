'use client'

import {SignOutButton, useUser} from '@clerk/nextjs'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

import {useCart} from '@/lib/hooks/useCart'

export const Navigation = () => {
  const {itemCount} = useCart()
  const pathname = usePathname()
  const {user, isLoaded} = useUser()

  const navLinks = [
    {href: '/products', label: 'Products'},
    {href: '/bundles', label: 'Bundles'},
    {href: '/members', label: 'Exchange'},
    {href: '/release-notes', label: 'Release Notes'},
  ]

  return (
    <header className="border-b-2 border-border bg-background sticky top-0 z-sticky" role="banner">
      <div className="max-w-[1400px] mx-auto px-xl py-lg flex items-center justify-between gap-xl flex-wrap">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight no-underline text-text hover:opacity-70 transition-all duration-fast"
          aria-label="Batch Theory - Home"
        >
          Batch Theory
        </Link>

        <nav className="flex gap-lg items-center" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium no-underline text-text px-md py-sm border border-transparent transition-all duration-fast hover:border-b-border ${
                pathname.startsWith(link.href) ? 'border-b-2 border-b-border' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/cart"
            className={`relative text-base font-medium no-underline text-text px-md py-sm border border-transparent transition-all duration-fast flex items-center gap-xs hover:border-b-border ${
              pathname === '/cart' ? 'border-b-2 border-b-border' : ''
            }`}
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ', empty'}`}
          >
            <span>Cart</span>
            {itemCount > 0 && (
              <span
                className="bg-primary text-background rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-xs font-bold font-mono px-[4px]"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            )}
          </Link>

          {!isLoaded ? (
            <div
              className="w-20 h-8 bg-border/30 animate-pulse rounded"
              aria-label="Loading authentication state"
            />
          ) : user ? (
            <div className="flex items-center gap-md">
              <Link
                href="/profile"
                className={`text-base font-medium no-underline text-text px-md py-sm border border-transparent transition-all duration-fast hover:border-b-border ${
                  pathname === '/profile' ? 'border-b-2 border-b-border' : ''
                }`}
              >
                Profile
              </Link>
              <SignOutButton>
                <button className="text-base font-medium text-text-secondary px-md py-sm border border-transparent transition-all duration-fast hover:text-text hover:border-b-border">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          ) : (
            <Link
              href="/login"
              className={`text-base font-medium no-underline text-text px-md py-sm border border-transparent transition-all duration-fast hover:border-b-border ${
                pathname === '/login' || pathname === '/signup' ? 'border-b-2 border-b-border' : ''
              }`}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
