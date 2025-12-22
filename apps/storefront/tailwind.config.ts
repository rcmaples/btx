import typography from '@tailwindcss/typography'
import type {Config} from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './sanity/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colors from src/styles/tokens.css.ts - Brutalist editorial palette
      colors: {
        primary: '#000000',
        'primary-dark': '#0a0a0a',
        secondary: '#1a1a1a',
        background: '#ffffff',
        'background-alt': '#f5f5f5',
        'background-secondary': '#fafafa',
        text: '#000000',
        'text-muted': '#666666',
        'text-secondary': '#444444',
        'text-tertiary': '#999999',
        border: '#000000',
        'border-light': '#e0e0e0',
        error: '#d32f2f',
        success: '#2e7d32',
        'success-light': '#e8f5e9',
        warning: '#ed6c02',
        'warning-light': '#fff3e0',
        danger: '#d32f2f',
        'danger-light': '#ffebee',
        'danger-dark': '#b71c1c',
        focus: '#000000',
        disabled: '#cccccc',
      },
      // Spacing from tokens
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        xxxl: '64px',
        huge: '96px',
      },
      // Typography from tokens - with line-height pairings
      fontSize: {
        xs: ['12px', {lineHeight: '1.5'}],
        sm: ['14px', {lineHeight: '1.5'}],
        base: ['16px', {lineHeight: '1.5'}],
        lg: ['18px', {lineHeight: '1.5'}],
        xl: ['20px', {lineHeight: '1.4'}],
        '2xl': ['24px', {lineHeight: '1.4'}],
        '3xl': ['30px', {lineHeight: '1.2'}],
        '4xl': ['36px', {lineHeight: '1.2'}],
        '5xl': ['48px', {lineHeight: '1.2'}],
        '6xl': ['60px', {lineHeight: '1.2'}],
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        display: ['serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      lineHeight: {
        tight: '1.2',
        snug: '1.4',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      // Border radius from tokens
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      // Border width from tokens
      borderWidth: {
        none: '0',
        thin: '1px',
        DEFAULT: '2px',
        thick: '3px',
        heavy: '4px',
      },
      // Box shadow from tokens
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        brutal: '4px 4px 0 0 rgba(0, 0, 0, 1)',
      },
      // Transitions from tokens
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Z-index from tokens
      zIndex: {
        base: '0',
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        modal: '1300',
        popover: '1400',
        tooltip: '1500',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [typography],
} satisfies Config
