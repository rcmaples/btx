'use client'

import type {InputHTMLAttributes} from 'react'

type PrivacyLevel = 'mask' | 'exclude' | 'unmask' | 'none'

interface FSFormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  error?: string
  privacy?: PrivacyLevel
  optional?: boolean
}

const privacyClasses: Record<PrivacyLevel, string> = {
  mask: 'fs-mask',
  exclude: 'fs-exclude',
  unmask: 'fs-unmask',
  none: '',
}

const baseInputClass =
  'w-full px-md py-sm border-2 border-border bg-background text-text focus:border-primary focus:outline-none transition-colors'

export function FSFormField({
  label,
  error,
  privacy = 'mask',
  optional = false,
  id,
  ...inputProps
}: FSFormFieldProps) {
  const fieldId = id || inputProps.name
  const privacyClass = privacyClasses[privacy]

  return (
    <div>
      {/* <label htmlFor={fieldId} className="block text-sm font-medium text-text mb-xs"> */}
      <label htmlFor={fieldId} className="block text-sm font-bold mb-xs text-text">
        {label}{' '}
        {optional ? (
          <span className="text-text-secondary">(optional)</span>
        ) : (
          <span className="text-error">*</span>
        )}
      </label>
      <input
        id={fieldId}
        className={`${privacyClass} ${baseInputClass}`.trim()}
        data-fs-element={`Form Field: ${label}`}
        {...inputProps}
      />
      {error && <p className="text-sm text-error mt-xs">{error}</p>}
    </div>
  )
}
