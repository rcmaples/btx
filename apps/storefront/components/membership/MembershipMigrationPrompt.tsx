'use client'

import {useState} from 'react'

interface MembershipMigrationPromptProps {
  onMigrate: () => Promise<{error: Error | null}>
  onDismiss: () => void
}

export function MembershipMigrationPrompt({
  onMigrate,
  onDismiss,
}: MembershipMigrationPromptProps) {
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMigrate = async () => {
    setIsMigrating(true)
    setError(null)

    try {
      const result = await onMigrate()
      if (result.error) {
        setError(result.error.message)
      }
    } catch {
      setError('Failed to link membership. Please try again.')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md">
      <div className="bg-background border-2 border-primary p-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-md">Link Your Membership</h2>
        <p className="text-text-secondary mb-lg">
          We noticed you&apos;re an Exchange member! Would you like to link your
          membership to your account? This will ensure you never lose access to
          exclusive products.
        </p>

        {error && (
          <div
            className="p-md bg-red-50 border border-error text-error mb-lg text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex gap-md">
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex-1 bg-primary text-background px-lg py-md border-2 border-primary hover:bg-transparent hover:text-primary transition-all font-bold disabled:opacity-50"
          >
            {isMigrating ? 'Linking...' : 'Yes, Link Membership'}
          </button>
          <button
            onClick={onDismiss}
            disabled={isMigrating}
            className="px-lg py-md border-2 border-border hover:border-text transition-colors font-bold disabled:opacity-50"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  )
}
