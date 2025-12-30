import './globals.css'

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import type {ReactNode} from 'react'

import {Footer} from '@/components/common/Footer'
import {FullStoryCapture} from '@/components/common/FullStoryCapture'
import {Navigation} from '@/components/common/Navigation'
import {QueryProvider} from '@/lib/providers/QueryProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Batch Theory - Specialty Coffee',
    template: '%s | Batch Theory',
  },
  description:
    'Premium coffee for those who take it seriously. Browse our selection of specialty coffee, curated bundles, and exclusive drops.',
  metadataBase: new URL('https://batchtheory.exchange'),
  openGraph: {
    title: 'Batch Theory - Specialty Coffee',
    description:
      'Premium coffee for those who take it seriously. Browse our selection of specialty coffee, curated bundles, and exclusive drops.',
    url: 'https://batchtheory.exchange',
    siteName: 'Batch Theory',
    type: 'website',
  },
}

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <FullStoryCapture />
      <body className="min-h-screen flex flex-col">
        <QueryProvider>
          {/* Skip link for keyboard navigation */}
          <a
            href="#main-content"
            className="absolute -top-full left-1/2 -translate-x-1/2 bg-primary text-background px-lg py-sm rounded z-[9999] transition-all duration-fast focus:top-md focus:outline focus:outline-2 focus:outline-focus focus:outline-offset-2"
          >
            Skip to main content
          </a>

          <Navigation />

          <main
            id="main-content"
            className="flex-1 max-w-[1400px] w-full mx-auto px-xl py-xxl"
            role="main"
          >
            {children}
          </main>

          <Footer />
        </QueryProvider>
      </body>
    </html>
  )
}
