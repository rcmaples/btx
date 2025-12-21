'use client'

import {useAuth} from '@/lib/providers/AuthProvider'
import {MembershipMigrationPrompt} from './MembershipMigrationPrompt'

export function MigrationPromptWrapper() {
  const {migrationPending, migrateLocalMembership, dismissMigration} = useAuth()

  if (!migrationPending) {
    return null
  }

  return (
    <MembershipMigrationPrompt
      onMigrate={migrateLocalMembership}
      onDismiss={dismissMigration}
    />
  )
}
