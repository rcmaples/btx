import type {ButtonHTMLAttributes} from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-background border-2 border-primary hover:bg-primary-dark hover:border-primary-dark',
  secondary:
    'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-background',
  ghost: 'bg-transparent text-text hover:bg-background-secondary border-2 border-transparent',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-sm px-md text-sm',
  md: 'py-md px-lg text-base',
  lg: 'py-lg px-xl text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    variantStyles[variant],
    sizeStyles[size],
    'font-bold',
    'cursor-pointer',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:bg-disabled disabled:border-disabled disabled:cursor-not-allowed disabled:opacity-60',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
