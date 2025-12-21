import {Box, Checkbox, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {ArrayOfPrimitivesInputProps} from 'sanity'
import {set, unset, useClient} from 'sanity'

interface OptionItem {
  title: string
  value: string
}

export interface DynamicArraySelectInputProps extends ArrayOfPrimitivesInputProps {
  query: string
}

/**
 * A custom input component for array of strings that fetches options dynamically from a GROQ query.
 * Renders as a checkbox list for multi-select functionality.
 *
 * @example
 * ```tsx
 * {
 *   name: 'bestFor',
 *   type: 'array',
 *   of: [{type: 'string'}],
 *   components: {
 *     input: (props) => (
 *       <DynamicArraySelectInput
 *         {...props}
 *         query='*[_type == "coffeeDrinks"][0].drinkType[]{"title": @, "value": @}'
 *       />
 *     ),
 *   },
 * }
 * ```
 */
export function DynamicArraySelectInput(props: DynamicArraySelectInputProps) {
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

  const handleCheckboxChange = useCallback(
    (optionValue: string, checked: boolean) => {
      let nextValue: string[]

      if (checked) {
        // Add the value to the array
        nextValue = [...currentValues, optionValue]
      } else {
        // Remove the value from the array
        nextValue = currentValues.filter((v) => v !== optionValue)
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
            <Checkbox
              id={`checkbox-${option.value}`}
              checked={isChecked}
              readOnly={readOnly}
              onChange={(event) => handleCheckboxChange(option.value, event.currentTarget.checked)}
            />
            <Box marginLeft={2}>
              <Text>
                <label htmlFor={`checkbox-${option.value}`}>{option.title}</label>
              </Text>
            </Box>
          </Flex>
        )
      })}
    </Stack>
  )
}
