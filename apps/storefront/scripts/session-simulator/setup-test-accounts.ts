#!/usr/bin/env npx tsx

/**
 * Setup script to create test accounts in Clerk for authenticated session simulation.
 *
 * This script uses the Clerk Backend API to create test users.
 * The CLERK_SECRET_KEY is loaded from the .env file.
 *
 * Usage:
 *   npx tsx scripts/session-simulator/setup-test-accounts.ts
 */

import 'dotenv/config'

import {TEST_ACCOUNTS} from './config.js'

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

if (!CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY environment variable is not set.')
  console.error('Please set it in your .env file or export it in your shell.')
  process.exit(1)
}

interface ClerkUser {
  id: string
  email_addresses: Array<{email_address: string}>
  first_name: string | null
  last_name: string | null
}

interface ClerkError {
  errors: Array<{
    code: string
    message: string
  }>
}

async function createClerkUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<ClerkUser | null> {
  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [email],
        password,
        first_name: firstName,
        last_name: lastName,
        skip_password_checks: true,
        skip_password_requirement: false,
      }),
    })

    if (!response.ok) {
      const error: ClerkError = await response.json()
      // Check if user already exists
      if (error.errors?.some((e) => e.code === 'form_identifier_exists')) {
        console.log(`  User ${email} already exists, skipping...`)
        return null
      }
      console.error(`  Failed to create user ${email}:`, error.errors?.[0]?.message)
      return null
    }

    const user: ClerkUser = await response.json()
    return user
  } catch (error) {
    console.error(`  Error creating user ${email}:`, error)
    return null
  }
}

async function listExistingUsers(): Promise<ClerkUser[]> {
  try {
    const response = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to list users')
      return []
    }

    const users: ClerkUser[] = await response.json()
    return users
  } catch (error) {
    console.error('Error listing users:', error)
    return []
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║           Clerk Test Account Setup                           ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')

  // Check existing users
  console.log('Checking existing users...')
  const existingUsers = await listExistingUsers()
  const existingEmails = new Set(
    existingUsers.flatMap((u) => u.email_addresses.map((e) => e.email_address)),
  )

  console.log(`Found ${existingUsers.length} existing users.`)
  console.log('')

  // Create test accounts
  console.log('Creating test accounts...')

  for (const account of TEST_ACCOUNTS) {
    console.log(`\nProcessing: ${account.email}`)

    if (existingEmails.has(account.email)) {
      console.log('  Already exists, skipping...')
      continue
    }

    const nameParts = account.id.split('-')
    const firstName = 'Test'
    const lastName = `User ${nameParts[nameParts.length - 1]}`

    const user = await createClerkUser(account.email, account.password, firstName, lastName)

    if (user) {
      console.log(`  Created successfully! Clerk ID: ${user.id}`)
    }
  }

  console.log('\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('Test Account Summary')
  console.log('═══════════════════════════════════════════════════════════════')

  for (const account of TEST_ACCOUNTS) {
    console.log(`\n  ID: ${account.id}`)
    console.log(`  Email: ${account.email}`)
    console.log(`  Password: ${account.password}`)
  }

  console.log('\n')
  console.log('These accounts can be used for authenticated session simulation.')
  console.log('Make sure to complete the profile for each account by visiting /complete-profile')
  console.log('after logging in for the first time.')
  console.log('')
}

main().catch(console.error)
