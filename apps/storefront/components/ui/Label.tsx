import type {LabelHTMLAttributes, ReactNode} from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  required?: boolean
  optional?: boolean
}

export function Label({
  children,
  required = false,
  optional = false,
  className = '',
  ...props
}: LabelProps) {
  const classes = ['block', 'text-sm', 'font-medium', 'text-text', 'mb-xs', className]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={classes} {...props}>
      {children} {required && <span className="text-error">*</span>}
      {optional && <span className="text-text-secondary">(optional)</span>}
    </label>
  )
}
