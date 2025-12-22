import {Box, Checkbox, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {ArrayOfPrimitivesInputProps} from 'sanity'
import {set, unset, useClient} from 'sanity'

export interface GrindCheckboxInputProps extends ArrayOfPrimitivesInputProps {
  query: string
}

/**
 * A custom input component for selecting available grind types from the grindTypes singleton.
 * Auto-initializes with all grind options selected for new documents or existing documents with empty values.
 * Stores grind strings directly.
 */
export function GrindCheckboxInput(props: GrindCheckboxInputProps) {
  const {value, onChange, query, readOnly} = props
  const client = useClient({apiVersion: '2024-01-01'})

  const [options, setOptions] = useState<string[]>([])
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
        const result = await client.fetch<string[]>(query)

        if (!isMounted) return

        if (!Array.isArray(result)) {
          setError('Query did not return an array')
          setOptions([])
          return
        }

        setOptions(result)
        setLoading(false)

        // Auto-initialize: select all grinds if field is empty (works for new and existing docs)
        if (!hasInitialized.current && result.length > 0) {
          hasInitialized.current = true
          // Check if current value is empty
          const currentVal = props.value
          const isEmpty = !currentVal || (Array.isArray(currentVal) && currentVal.length === 0)

          if (isEmpty) {
            onChangeRef.current(set(result))
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
  }, [client, props.value, query]) // Only depend on client and query, not value/onChange

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
          Loading grind options...
        </Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          Error loading grind options: {error}
        </Text>
      </Stack>
    )
  }

  if (options.length === 0) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          No grind options available. Please configure the Grind Types singleton.
        </Text>
      </Stack>
    )
  }

  return (
    <Stack space={3}>
      {options.map((grind) => {
        const isChecked = currentValues.includes(grind)
        return (
          <Flex key={grind} align="center">
            <Checkbox
              id={`grind-checkbox-${grind}`}
              checked={isChecked}
              readOnly={readOnly}
              onChange={() => handleCheckboxChange(grind)}
            />
            <Box marginLeft={2}>
              <Text>
                <label htmlFor={`grind-checkbox-${grind}`}>{grind}</label>
              </Text>
            </Box>
          </Flex>
        )
      })}
    </Stack>
  )
}
