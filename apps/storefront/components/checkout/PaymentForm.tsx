'use client'

export function PaymentForm() {
  return (
    <div className="fs-exclude space-y-lg">
      <h2 className="text-xl font-bold">Payment Information</h2>

      {/* Test Mode Banner */}
      <div className="p-md bg-yellow-50 dark:bg-yellow-950/30 border-2 border-warning">
        <p className="font-bold text-warning mb-xs">Test Mode Payment</p>
        <p className="text-sm text-text-secondary">
          This is a test transaction. No real payment will be processed. The following test card
          details will be used automatically.
        </p>
      </div>

      {/* Test Card Display */}
      <div className="bg-background-secondary">
        <div className="space-y-md">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-bold mb-xs text-text-secondary">Card Number</label>
            <input
              type="text"
              value="4242 4242 4242 4242"
              disabled
              className="w-full px-md py-sm border-2 border-border bg-background-alt text-text-secondary font-mono cursor-not-allowed"
            />
          </div>

          {/* Expiration and CVV */}
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold mb-xs text-text-secondary">
                Expiration
              </label>
              <input
                type="text"
                value="12/31"
                disabled
                className="w-full px-md py-sm border-2 border-border bg-background-alt text-text-secondary font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-xs text-text-secondary">CVV</label>
              <input
                type="text"
                value="555"
                disabled
                className="w-full px-md py-sm border-2 border-border bg-background-alt text-text-secondary font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <p className="mt-md text-xs text-text-secondary">
          These are default test values that cannot be modified in test mode.
        </p>
      </div>
    </div>
  )
}
