'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'

interface CheckoutSuccessProps {
  orderNumber: string
}

export function CheckoutSuccess({orderNumber}: CheckoutSuccessProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Separate effect for navigation
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/')
    }
  }, [countdown, router])

  return (
    <div className="p-lg bg-green-50 dark:bg-green-950/30 border-2 border-success" role="status">
      <div className="flex items-start gap-md">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-success"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-success mb-sm">Order Placed Successfully!</h2>
          <p className="text-text mb-xs">
            Your order number is: <span className="font-mono font-bold">{orderNumber}</span>
          </p>
          <p className="text-sm text-text-secondary">
            Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  )
}
