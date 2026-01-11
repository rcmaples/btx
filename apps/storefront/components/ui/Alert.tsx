import type {ReactNode} from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-background-secondary border-border text-text',
  success: 'bg-success-light border-success text-success',
  warning: 'bg-warning-light border-warning text-warning',
  error: 'bg-danger-light border-danger text-danger',
}

export function Alert({variant = 'info', children, className = ''}: AlertProps) {
  const classes = ['p-md', 'border-2', variantStyles[variant], className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="alert">
      {children}
    </div>
  )
}
