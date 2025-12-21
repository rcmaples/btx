import {Box, Button, Card, Flex, Spinner, Stack, Text, TextInput} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {ArrayOfObjectsInputProps} from 'sanity'
import {set, unset, useClient, useFormValue} from 'sanity'

// Simple unique ID generator (replacement for nanoid)
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

interface SizeInfo {
  _key: string
  name: string
  grams: number
}

interface PriceEntry {
  _key: string
  sizeKey: string
  sizeName: string
  grams: number
  priceInCents: number
  isBasePrice: boolean
}

/**
 * A custom input component for dynamic pricing based on selected sizes.
 * - Shows price inputs only for sizes selected in availableSizes field
 * - Auto-calculates prices proportionally based on the base price (smallest size)
 * - Allows manual override of any price
 */
export function DynamicPricingInput(props: ArrayOfObjectsInputProps) {
  const {value, onChange, readOnly} = props
  const client = useClient({apiVersion: '2024-01-01'})

  // Read selected size keys from the current document
  const selectedSizeKeys = useFormValue(['availableSizes']) as string[] | undefined

  const [allSizes, setAllSizes] = useState<SizeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all size definitions from singleton
  useEffect(() => {
    let isMounted = true

    async function fetchSizes() {
      try {
        setLoading(true)
        setError(null)
        const result = await client.fetch<SizeInfo[]>(
          '*[_type == "availableSizes"][0].sizeTypes[]{_key, "name": name, grams}',
        )

        if (!isMounted) return

        if (!Array.isArray(result)) {
          setError('Failed to load size definitions')
          setAllSizes([])
        } else {
          setAllSizes(result)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to fetch sizes')
        setAllSizes([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSizes()

    return () => {
      isMounted = false
    }
  }, [client])

  // Get only the sizes that are selected, sorted by grams
  const activeSizes = useMemo(() => {
    if (!selectedSizeKeys || !allSizes.length) return []
    return allSizes
      .filter((size) => selectedSizeKeys.includes(size._key))
      .sort((a, b) => a.grams - b.grams)
  }, [selectedSizeKeys, allSizes])

  // Find the base size (smallest grams)
  const baseSize = useMemo(() => {
    return activeSizes[0] || null
  }, [activeSizes])

  // Current pricing as a map for easy lookup
  const pricingMap = useMemo(() => {
    const map = new Map<string, PriceEntry>()
    if (Array.isArray(value)) {
      ;(value as PriceEntry[]).forEach((entry) => {
        if (entry?.sizeKey) {
          map.set(entry.sizeKey, entry)
        }
      })
    }
    return map
  }, [value])

  // Sync pricing array when selected sizes change
  useEffect(() => {
    if (loading || !allSizes.length) return
    if (!selectedSizeKeys || selectedSizeKeys.length === 0) {
      // No sizes selected - clear pricing
      if (value && Array.isArray(value) && value.length > 0) {
        onChange(unset())
      }
      return
    }

    const currentPricing = (Array.isArray(value) ? value : []) as PriceEntry[]
    const currentKeys = new Set(currentPricing.map((p) => p.sizeKey))
    const activeKeys = new Set(activeSizes.map((s) => s._key))

    // Check if we need to add or remove entries
    const needsAddition = activeSizes.some((s) => !currentKeys.has(s._key))
    const needsRemoval = currentPricing.some((p) => !activeKeys.has(p.sizeKey))

    if (needsAddition || needsRemoval) {
      // Find base price from existing entries
      const basePriceEntry = currentPricing.find((p) => p.isBasePrice)
      const basePrice = basePriceEntry?.priceInCents || 0
      const baseGrams = basePriceEntry?.grams || baseSize?.grams || 240

      const newPricing: PriceEntry[] = activeSizes.map((size) => {
        const existing = pricingMap.get(size._key)
        if (existing && activeKeys.has(existing.sizeKey)) {
          // Update isBasePrice flag in case base size changed
          return {
            ...existing,
            isBasePrice: size._key === baseSize?._key,
          }
        }

        // Calculate price for new size based on gram ratio
        const calculatedPrice = basePrice > 0 ? Math.round(basePrice * (size.grams / baseGrams)) : 0

        return {
          _key: generateKey(),
          sizeKey: size._key,
          sizeName: size.name,
          grams: size.grams,
          priceInCents: calculatedPrice,
          isBasePrice: size._key === baseSize?._key,
        }
      })

      onChange(set(newPricing))
    }
  }, [activeSizes, selectedSizeKeys, value, loading, baseSize, pricingMap, onChange, allSizes])

  // Recalculate all prices from base
  const recalculateFromBase = useCallback(() => {
    if (!baseSize) return

    const currentPricing = (Array.isArray(value) ? value : []) as PriceEntry[]
    const baseEntry = currentPricing.find((p) => p.isBasePrice)
    const basePrice = baseEntry?.priceInCents || 0

    if (basePrice <= 0) return

    const newPricing = activeSizes.map((size) => {
      const existing = pricingMap.get(size._key)
      const isBase = size._key === baseSize._key

      const price = isBase ? basePrice : Math.round(basePrice * (size.grams / baseSize.grams))

      return {
        _key: existing?._key || generateKey(),
        sizeKey: size._key,
        sizeName: size.name,
        grams: size.grams,
        priceInCents: price,
        isBasePrice: isBase,
      }
    })

    onChange(set(newPricing))
  }, [activeSizes, baseSize, pricingMap, value, onChange])

  // Handle individual price change
  const handlePriceChange = useCallback(
    (sizeKey: string, newPrice: number) => {
      const currentPricing = (Array.isArray(value) ? value : []) as PriceEntry[]
      const entryIndex = currentPricing.findIndex((p) => p.sizeKey === sizeKey)

      if (entryIndex === -1) return

      const entry = currentPricing[entryIndex]

      // If changing base price, recalculate all others
      if (entry.isBasePrice && baseSize) {
        const newPricing = activeSizes.map((size) => {
          const existing = pricingMap.get(size._key)
          const isBase = size._key === baseSize._key

          const price = isBase ? newPrice : Math.round(newPrice * (size.grams / baseSize.grams))

          return {
            _key: existing?._key || generateKey(),
            sizeKey: size._key,
            sizeName: size.name,
            grams: size.grams,
            priceInCents: price,
            isBasePrice: isBase,
          }
        })
        onChange(set(newPricing))
      } else {
        // Just update this one price
        const updated = currentPricing.map((p) =>
          p.sizeKey === sizeKey ? {...p, priceInCents: newPrice} : p,
        )
        onChange(set(updated))
      }
    },
    [value, activeSizes, baseSize, pricingMap, onChange],
  )

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  // Render loading state
  if (loading) {
    return (
      <Stack space={2}>
        <Spinner muted />
        <Text muted size={1}>
          Loading pricing options...
        </Text>
      </Stack>
    )
  }

  // Render error state
  if (error) {
    return (
      <Card padding={3} tone="critical">
        <Text size={1}>Error: {error}</Text>
      </Card>
    )
  }

  // Render empty state when no sizes selected
  if (!selectedSizeKeys || selectedSizeKeys.length === 0) {
    return (
      <Card padding={4} tone="caution" border radius={2}>
        <Text muted size={1}>
          Select sizes above to configure pricing.
        </Text>
      </Card>
    )
  }

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Enter the base price ({baseSize?.name || 'smallest size'}). Other sizes auto-calculate
        proportionally based on weight.
      </Text>

      <Stack space={3}>
        {activeSizes.map((size) => {
          const entry = pricingMap.get(size._key)
          const isBase = size._key === baseSize?._key
          const priceValue = entry?.priceInCents || 0

          return (
            <Card
              key={size._key}
              padding={3}
              border
              radius={2}
              tone={isBase ? 'primary' : 'default'}
            >
              <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                <Stack space={2} flex={1} style={{minWidth: '120px'}}>
                  <Text weight={isBase ? 'semibold' : 'regular'} size={2}>
                    {size.name}
                  </Text>
                  {isBase && (
                    <Text size={1} muted>
                      Base price
                    </Text>
                  )}
                  {!isBase && (
                    <Text size={1} muted>
                      {size.grams}g
                    </Text>
                  )}
                </Stack>

                <Flex align="center" gap={2}>
                  <TextInput
                    type="number"
                    value={priceValue || ''}
                    placeholder="0"
                    onChange={(e) =>
                      handlePriceChange(size._key, parseInt(e.currentTarget.value) || 0)
                    }
                    readOnly={readOnly}
                    style={{width: '120px'}}
                  />
                  <Text size={1} muted>
                    cents
                  </Text>
                </Flex>

                <Box style={{minWidth: '80px', textAlign: 'right'}}>
                  <Text size={2} weight="semibold">
                    {formatPrice(priceValue)}
                  </Text>
                </Box>
              </Flex>
            </Card>
          )
        })}
      </Stack>

      <Flex gap={2}>
        <Button
          text="Recalculate from base"
          mode="ghost"
          tone="primary"
          onClick={recalculateFromBase}
          disabled={readOnly || !baseSize}
        />
      </Flex>
    </Stack>
  )
}
