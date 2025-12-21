import {Select, Spinner, Stack, Text} from '@sanity/ui'
import {useCallback, useEffect, useState} from 'react'
import type {StringInputProps} from 'sanity'
import {set, unset, useClient} from 'sanity'

interface OptionItem {
  title: string
  value: string
}

export interface DynamicSelectInputProps extends StringInputProps {
  query: string
}

/**
 * A custom input component that fetches options dynamically from a GROQ query.
 * Use this for string fields where options come from singleton documents.
 *
 * @example
 * ```tsx
 * {
 *   name: 'roastLevel',
 *   type: 'string',
 *   components: {
 *     input: (props) => (
 *       <DynamicSelectInput
 *         {...props}
 *         query='*[_type == "roastLevels"][0].roastTypes[]{"title": title, "value": value}'
 *       />
 *     ),
 *   },
 * }
 * ```
 */
export function DynamicSelectInput(props: DynamicSelectInputProps) {
  const {value, onChange, query, readOnly, elementProps} = props
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

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      if (nextValue === '') {
        onChange(unset())
      } else {
        onChange(set(nextValue))
      }
    },
    [onChange],
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
    <Select {...elementProps} value={value || ''} onChange={handleChange} readOnly={readOnly}>
      <option value="">Select an option...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.title}
        </option>
      ))}
    </Select>
  )
}
