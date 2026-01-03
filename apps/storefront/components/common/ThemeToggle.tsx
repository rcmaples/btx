'use client'

import {trackThemeToggle} from '@/lib/fullstory/utils'
import {useTheme} from '@/lib/providers/ThemeProvider'

export function ThemeToggle() {
  const {resolvedTheme, setTheme, theme} = useTheme()

  const cycleTheme = () => {
    // Cycle: system -> light -> dark -> system
    const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    const newResolvedTheme =
      nextTheme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : nextTheme

    trackThemeToggle({
      previous_theme: theme,
      new_theme: nextTheme,
      resolved_theme: newResolvedTheme,
    })

    setTheme(nextTheme)
  }

  const getLabel = () => {
    if (theme === 'system') return 'System theme'
    if (theme === 'light') return 'Light theme'
    return 'Dark theme'
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="w-10 h-10 flex items-center justify-center text-text border border-transparent transition-all duration-fast hover:border-b-border"
      aria-label={`${getLabel()}. Click to change.`}
      title={getLabel()}
    >
      {theme === 'system' ? (
        // Monitor icon for system mode
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ) : resolvedTheme === 'dark' ? (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  )
}
