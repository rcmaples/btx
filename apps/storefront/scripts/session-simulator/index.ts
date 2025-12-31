#!/usr/bin/env npx tsx

import 'dotenv/config'

import {BASE_URL} from './config.js'
import {runSimulator} from './session-runner.js'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name: string, defaultValue: string): string => {
  const index = args.indexOf(`--${name}`)
  if (index !== -1 && args[index + 1]) {
    return args[index + 1]
  }
  return defaultValue
}

const hasFlag = (name: string): boolean => {
  return args.includes(`--${name}`)
}

// Configuration from command line
const totalSessions = parseInt(getArg('sessions', '50'), 10)
const headless = !hasFlag('headed')
const slowMo = hasFlag('slow') ? 100 : undefined
const delayBetweenSessions = parseInt(getArg('delay', '0'), 10)
const baseUrl = getArg('url', BASE_URL)
const personaFilter = getArg('persona', '')

// Show help
if (hasFlag('help') || hasFlag('h')) {
  console.log(`
Batch Theory Session Simulator
==============================

Generates synthetic user sessions for FullStory analytics.

Usage:
  npx tsx scripts/session-simulator/index.ts [options]

Options:
  --sessions <number>   Number of sessions to generate (default: 50)
  --headed              Run browser in headed mode (visible)
  --slow                Add slowMo delay for debugging
  --delay <ms>          Delay between sessions in milliseconds
  --url <url>           Base URL to test (default: ${BASE_URL})
  --persona <type>      Filter to specific persona(s):
                        - "auth" for authenticated only (member, returning-customer)
                        - "guest" for guest only
                        - or specific: browser, reader, impulse-buyer, cart-abandoner,
                          member, window-shopper, deal-seeker, returning-customer
  --help, -h            Show this help message

Examples:
  # Run 50 sessions in headless mode
  npx tsx scripts/session-simulator/index.ts

  # Run 10 sessions with visible browser
  npx tsx scripts/session-simulator/index.ts --sessions 10 --headed

  # Run with slow motion for debugging
  npx tsx scripts/session-simulator/index.ts --sessions 5 --headed --slow

  # Run against local development
  npx tsx scripts/session-simulator/index.ts --url http://localhost:3000

Session Personas (weighted random selection):
  - browser (25%)         Casual product browsing
  - cart-abandoner (20%)  Adds to cart but abandons
  - reader (15%)          Enters via release notes
  - impulse-buyer (15%)   Quick purchase as guest
  - member (45%)          Authenticated member purchase
  - window-shopper (10%)  Browses bundles extensively
  - deal-seeker (5%)      Tries promo codes
  - returning-customer (5%) Quick authenticated purchase

Output:
  - Session results logged to console
  - FullStory session URLs (when available)
  - Authentication and purchase status
  - Summary statistics at the end
`)
  process.exit(0)
}

// Run the simulator
console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Batch Theory Session Simulator                     ║
╠══════════════════════════════════════════════════════════════╣
║  Sessions: ${String(totalSessions).padEnd(47)}║
║  Mode: ${(headless ? 'Headless' : 'Headed').padEnd(51)}║
║  URL: ${baseUrl.padEnd(52)}║
${personaFilter ? `║  Persona: ${personaFilter.padEnd(47)}║\n` : ''}${delayBetweenSessions > 0 ? `║  Delay: ${String(delayBetweenSessions) + 'ms between sessions'.padEnd(49)}║\n` : ''}╚══════════════════════════════════════════════════════════════╝
`)

runSimulator({
  baseUrl,
  totalSessions,
  headless,
  slowMo,
  delayBetweenSessions: delayBetweenSessions || undefined,
  personaFilter: personaFilter || undefined,
})
  .then((results) => {
    const errors = results.filter((r) => r.error).length
    process.exit(errors > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error('Simulator failed:', error)
    process.exit(1)
  })
