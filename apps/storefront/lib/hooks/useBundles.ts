'use client'

import {useEffect, useState} from 'react'

import {bundleService} from '@/lib/services/bundle/bundle-service'
import type {SanityBundle} from '@/lib/types'

export function useBundles(isMember?: boolean) {
  const [data, setData] = useState<SanityBundle[] | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    bundleService
      .getBundlesClient({isMember})
      .then((bundles) => {
        if (!cancelled) setData(bundles)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isMember])

  return {data, isLoading, error}
}

export function useBundleBySlug(slug: string) {
  const [data, setData] = useState<SanityBundle | null | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!slug) {
      setData(undefined)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    bundleService
      .getBundleBySlugClient(slug)
      .then((bundle) => {
        if (!cancelled) setData(bundle)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return {data, isLoading, error}
}
