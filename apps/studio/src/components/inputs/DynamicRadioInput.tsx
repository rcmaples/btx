import {Box, Flex, Radio, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useState} from 'react'
import type {StringInputProps} from 'sanity'
import {set, useClient} from 'sanity'

interface OptionItem {
  title: string
  value: string
}

export interface DynamicRadioInputProps extends StringInputProps {
  query: string
}

/**
 * A custom input component that fetches options dynamically from a GROQ query.
 * Renders as a radio list for single-select functionality.
 *
 * @example
 * ```tsx
 * {
 *   name: 'roastLevel',
 *   type: 'string',
 *   components: {
 *     input: (props) => (
 *       <DynamicRadioInput
 *         {...props}
 *         query='*[_type == "roastLevels"][0].roastTypes[]{"title": title, "value": value}'
 *       />
 *     ),
 *   },
 * }
 * ```
 */
export function DynamicRadioInput(props: DynamicRadioInputProps) {
  const {value, onChange, query, readOnly} = props
  const client = useClient({apiVersion: '2024-01-01'})

  const [options, setOptions] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      if (optionValue === value) {
        // If clicking the same value, optionally unset (or keep it selected)
        // For now, we'll keep it selected (do nothing)
        return
      }
      onChange(set(optionValue))
    },
    [onChange, value],
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
        const isChecked = value === option.value
        return (
          <Flex key={option.value} align="center">
            <Radio
              id={`radio-${option.value}`}
              name={props.path.join('.')}
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
