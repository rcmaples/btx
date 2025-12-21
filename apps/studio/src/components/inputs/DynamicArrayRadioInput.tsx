import {Box, Flex, Radio, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {ArrayOfPrimitivesInputProps} from 'sanity'
import {set, unset, useClient} from 'sanity'

interface OptionItem {
  title: string
  value: string
}

export interface DynamicArrayRadioInputProps extends ArrayOfPrimitivesInputProps {
  query: string
}

/**
 * A custom input component for array of strings that fetches options dynamically from a GROQ query.
 * Renders as a radio list with multiple selection capability (like checkboxes but with radio styling).
 *
 * @example
 * ```tsx
 * {
 *   name: 'bestFor',
 *   type: 'array',
 *   of: [{type: 'string'}],
 *   components: {
 *     input: (props) => (
 *       <DynamicArrayRadioInput
 *         {...props}
 *         query='*[_type == "coffeeDrinks"][0].drinkTypes[]{"title": title, "value": value}'
 *       />
 *     ),
 *   },
 * }
 * ```
 */
export function DynamicArrayRadioInput(props: DynamicArrayRadioInputProps) {
  const {value = [], onChange, query, readOnly} = props
  const client = useClient({apiVersion: '2024-01-01'})

  const [options, setOptions] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For arrays of primitives, value is the array of string values directly
  const currentValues = useMemo<string[]>(
    () =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [],
    [value],
  )

  useEffect(() => {
    let isMounted = true

    async function fetchOptions() {
      try {
        setLoading(true)
        setError(null)
        const result = await client.fetch<OptionItem[]>(query)

        if (!isMounted) return

        if (!Array.isArray(result)) {
          setError('Query did not return an array')
          setOptions([])
        } else {
          setOptions(result)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
        setOptions([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchOptions()

    return () => {
      isMounted = false
    }
  }, [client, query])

  const handleRadioChange = useCallback(
    (optionValue: string) => {
      let nextValue: string[]

      if (currentValues.includes(optionValue)) {
        // Remove the value from the array
        nextValue = currentValues.filter((v) => v !== optionValue)
      } else {
        // Add the value to the array
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
          Loading options...
        </Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          Error loading options: {error}
        </Text>
      </Stack>
    )
  }

  if (options.length === 0) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          No options available. Please configure the source document.
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
            <Radio
              id={`radio-${option.value}`}
              checked={isChecked}
              readOnly={readOnly}
              onChange={() => handleRadioChange(option.value)}
            />
            <Box marginLeft={2}>
              <Text>
                <label htmlFor={`radio-${option.value}`}>{option.title}</label>
              </Text>
            </Box>
          </Flex>
        )
      })}
    </Stack>
  )
}
