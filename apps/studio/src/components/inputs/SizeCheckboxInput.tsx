import {Box, Checkbox, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {ArrayOfPrimitivesInputProps} from 'sanity'
import {set, unset, useClient, useFormValue} from 'sanity'

interface SizeOption {
  _key: string
  title: string
  value: string // Same as _key
  grams: number
}

export interface SizeCheckboxInputProps extends ArrayOfPrimitivesInputProps {
  query: string
}

/**
 * A custom input component for selecting available sizes from the availableSizes singleton.
 * Auto-initializes with all sizes selected for new documents or existing documents with empty values.
 * Stores _key references for stable data relationships.
 */
export function SizeCheckboxInput(props: SizeCheckboxInputProps) {
  const {value, onChange, query, readOnly} = props
  const client = useClient({apiVersion: '2024-01-01'})

  const [options, setOptions] = useState<SizeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use refs to avoid re-fetching on value/onChange changes
  const hasInitialized = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Current selected values
  const currentValues = useMemo<string[]>(
    () =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [],
    [value],
  )

  // Fetch options only once on mount
  useEffect(() => {
    let isMounted = true

    async function fetchOptions() {
      try {
        setLoading(true)
        setError(null)
        const result = await client.fetch<SizeOption[]>(query)

        if (!isMounted) return

        if (!Array.isArray(result)) {
          setError('Query did not return an array')
          setOptions([])
          return
        }

        setOptions(result)
        setLoading(false)

        // Auto-initialize: select all sizes if field is empty (works for new and existing docs)
        if (!hasInitialized.current && result.length > 0) {
          hasInitialized.current = true
          // Check if current value is empty
          const currentVal = props.value
          const isEmpty = !currentVal || (Array.isArray(currentVal) && currentVal.length === 0)

          if (isEmpty) {
            const allKeys = result.map((opt) => opt.value)
            onChangeRef.current(set(allKeys))
          }
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
        setOptions([])
        setLoading(false)
      }
    }

    fetchOptions()

    return () => {
      isMounted = false
    }
  }, [client, query]) // Only depend on client and query, not value/onChange

  const handleCheckboxChange = useCallback(
    (optionValue: string) => {
      let nextValue: string[]

      if (currentValues.includes(optionValue)) {
        nextValue = currentValues.filter((v) => v !== optionValue)
      } else {
        nextValue = [...currentValues, optionValue]
      }

      if (nextValue.length === 0) {
        onChange(unset())
      } else {
        onChange(set(nextValue))
      }
    },
    [onChange, currentValues],
  )

  if (loading) {
    return (
      <Stack space={2}>
        <Spinner muted />
        <Text muted size={1}>
          Loading sizes...
        </Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          Error loading sizes: {error}
        </Text>
      </Stack>
    )
  }

  if (options.length === 0) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          No sizes available. Please configure the Available Sizes singleton.
        </Text>
      </Stack>
    )
  }

  return (
    <Stack space={3}>
      {options.map((option) => {
        const isChecked = currentValues.includes(option.value)
        return (
          <Flex key={option.value} align="center">
            <Checkbox
              id={`size-checkbox-${option.value}`}
              checked={isChecked}
              readOnly={readOnly}
              onChange={() => handleCheckboxChange(option.value)}
            />
            <Box marginLeft={2}>
              <Text>
                <label htmlFor={`size-checkbox-${option.value}`}>
                  {option.title} ({option.grams}g)
                </label>
              </Text>
            </Box>
          </Flex>
        )
      })}
    </Stack>
  )
}
