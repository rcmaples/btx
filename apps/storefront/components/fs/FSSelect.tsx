'use client'

import type {SelectHTMLAttributes} from 'react'

type PrivacyLevel = 'mask' | 'exclude' | 'unmask' | 'none'

interface FSSelectOption {
  value: string
  label: string
}

interface FSSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string
  options: FSSelectOption[]
  error?: string
  privacy?: PrivacyLevel
  optional?: boolean
  placeholder?: string
}

const privacyClasses: Record<PrivacyLevel, string> = {
  mask: 'fs-mask',
  exclude: 'fs-exclude',
  unmask: 'fs-unmask',
  none: '',
}

const baseSelectClass =
  'w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors'

export function FSSelect({
  label,
  options,
  error,
  privacy = 'none',
  optional = false,
  placeholder = 'Select...',
  id,
  ...selectProps
}: FSSelectProps) {
  const fieldId = id || selectProps.name
  const privacyClass = privacyClasses[privacy]

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-text mb-xs">
        {label}{' '}
        {optional ? (
          <span className="text-text-secondary">(optional)</span>
        ) : (
          <span className="text-error">*</span>
        )}
      </label>
      <select
        id={fieldId}
        className={`${privacyClass} ${baseSelectClass}`.trim()}
        data-fs-element={`Form Select: ${label}`}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-error mt-xs">{error}</p>}
    </div>
  )
}
