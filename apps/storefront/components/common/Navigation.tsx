'use client'

import {SignOutButton, useUser} from '@clerk/nextjs'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'

import {ThemeToggle} from '@/components/common/ThemeToggle'
import {useCart} from '@/lib/hooks/useCart'

export const Navigation = () => {
  const {itemCount} = useCart()
  const pathname = usePathname()
  const {user, isLoaded} = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    {href: '/products', label: 'Products'},
    {href: '/bundles', label: 'Bundles'},
    {href: '/members', label: 'Exchange'},
    {href: '/release-notes', label: 'Release Notes'},
  ]

  return (
    <header className="border-b-2 border-border bg-background sticky top-0 z-sticky" role="banner">
      <div className="max-w-[1400px] mx-auto px-xl py-lg flex items-center justify-between gap-xl">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight no-underline text-text hover:opacity-70 transition-all duration-fast"
          aria-label="Batch Theory - Home"
        >
          Batch Theory
        </Link>

        {/* Hamburger button - mobile only */}
        <button
          type="button"
          className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[6px] text-text"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className={`block w-6 h-[2px] bg-current transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-current transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-current transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''
            }`}
          />
        </button>

        {/* Desktop navigation */}
        <nav
          className="hidden md:flex gap-lg items-center"
          role="navigation"
          aria-label="Main navigation"
        >
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

          <ThemeToggle />

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

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[1200] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <nav
          className={`absolute top-0 right-0 h-full w-[80%] max-w-[300px] bg-background border-l-2 border-border transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Close button */}
          <div className="flex justify-end p-lg">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-text hover:opacity-70 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex flex-col px-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium no-underline text-text py-md border-b border-border/30 transition-all duration-fast hover:opacity-70 ${
                  pathname.startsWith(link.href) ? 'font-bold' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/cart"
              className={`text-lg font-medium no-underline text-text py-md border-b border-border/30 transition-all duration-fast flex items-center gap-sm hover:opacity-70 ${
                pathname === '/cart' ? 'font-bold' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
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

            {/* Auth section */}
            {!isLoaded ? (
              <div
                className="w-20 h-8 bg-border/30 animate-pulse rounded my-md"
                aria-label="Loading authentication state"
              />
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className={`text-lg font-medium no-underline text-text py-md border-b border-border/30 transition-all duration-fast hover:opacity-70 ${
                    pathname === '/profile' ? 'font-bold' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <SignOutButton>
                  <button
                    className="text-lg font-medium text-text-secondary py-md text-left transition-all duration-fast hover:text-text"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Out
                  </button>
                </SignOutButton>
              </>
            ) : (
              <Link
                href="/login"
                className={`text-lg font-medium no-underline text-text py-md transition-all duration-fast hover:opacity-70 ${
                  pathname === '/login' || pathname === '/signup' ? 'font-bold' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}

            {/* Theme toggle */}
            <div className="mt-lg pt-lg border-t border-border/30 flex items-center gap-md">
              <span className="text-sm text-text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
