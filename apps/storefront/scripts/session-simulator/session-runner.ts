import {mkdirSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {type Browser, type BrowserContext, chromium} from 'playwright'

import {captureFullStoryUrl, randomPick, waitForPageReady} from './behaviors.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
import {CONTENT_CATALOG, SESSION_PERSONAS, TEST_ACCOUNTS, USER_AGENTS, VIEWPORTS} from './config.js'
import {executePersona} from './personas.js'
import type {
  SessionPersona,
  SessionResult,
  SimulatorOptions,
  UserAgent,
  UserIdentity,
} from './types.js'

/**
 * Get filtered personas based on filter string
 */
function getFilteredPersonas(filter?: string): SessionPersona[] {
  if (!filter) return SESSION_PERSONAS

  switch (filter.toLowerCase()) {
    case 'auth':
    case 'authenticated':
      return SESSION_PERSONAS.filter((p) => p.requiresAuth)
    case 'guest':
    case 'unauthenticated':
      return SESSION_PERSONAS.filter((p) => !p.requiresAuth)
    default: {
      const matchedPersona = SESSION_PERSONAS.find(
        (p) => p.type.toLowerCase() === filter.toLowerCase(),
      )
      return matchedPersona ? [matchedPersona] : SESSION_PERSONAS
    }
  }
}

/**
 * Select a persona based on weighted probability
 */
function selectWeightedPersona(filter?: string): SessionPersona {
  const personas = getFilteredPersonas(filter)
  const totalWeight = personas.reduce((sum, p) => sum + p.weight, 0)
  let random = Math.random() * totalWeight

  for (const persona of personas) {
    random -= persona.weight
    if (random <= 0) {
      return persona
    }
  }

  return personas[0] // Fallback
}

/**
 * Generate a unique user identity
 */
function generateUserIdentity(index: number, requiresAuth: boolean): UserIdentity {
  if (requiresAuth && TEST_ACCOUNTS.length > 0) {
    // Use a test account for authenticated sessions
    const account = TEST_ACCOUNTS[index % TEST_ACCOUNTS.length]
    return {
      id: account.id,
      email: account.email,
      password: account.password,
      isAuthenticated: true,
    }
  }

  // Generate a unique guest identity
  return {
    id: `guest-${Date.now()}-${index}-${Math.random().toString(36).substring(7)}`,
    isAuthenticated: false,
  }
}

/**
 * Determine entry point based on persona
 */
function determineEntryPoint(persona: SessionPersona): string {
  switch (persona.type) {
    case 'reader': {
      // Enter via a random article
      const article = randomPick(CONTENT_CATALOG.articles)
      return `/release-notes/${article.slug}`
    }

    case 'window-shopper':
      return '/bundles'

    case 'member':
    case 'returning-customer':
      return '/login'

    case 'browser':
    case 'impulse-buyer':
    case 'cart-abandoner':
    case 'deal-seeker':
    default: {
      // Randomly choose between home, products, or a specific product
      const options = ['/', '/products', `/products/${randomPick(CONTENT_CATALOG.products).slug}`]
      return randomPick(options)
    }
  }
}

/**
 * Create a browser context with unique identity
 */
async function createSessionContext(
  browser: Browser,
  userAgent: UserAgent,
  userId: string,
): Promise<BrowserContext> {
  const viewport = randomPick([VIEWPORTS.desktop, VIEWPORTS.laptop])

  const context = await browser.newContext({
    userAgent: userAgent.value,
    viewport,
    locale: 'en-US',
    timezoneId: randomPick([
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
    ]),
    // Generate unique storage state for each user
    storageState: undefined, // Fresh state for each session
  })

  // Set a unique cookie to help FullStory distinguish users
  await context.addCookies([
    {
      name: 'btx_session_id',
      value: userId,
      domain: 'batchtheory.exchange',
      path: '/',
    },
    {
      name: 'btx_user_id',
      value: userId,
      domain: 'batchtheory.exchange',
      path: '/',
    },
  ])

  return context
}

/**
 * Run a single session
 */
async function runSession(
  browser: Browser,
  sessionNumber: number,
  options: SimulatorOptions,
): Promise<SessionResult> {
  const startTime = Date.now()

  // Select persona and user agent
  const persona = selectWeightedPersona(options.personaFilter)
  const userAgent = randomPick(USER_AGENTS)
  const userIdentity = generateUserIdentity(sessionNumber, persona.requiresAuth)
  const entryPoint = determineEntryPoint(persona)

  process.stdout.write(`Session #${sessionNumber} [${persona.type}]...`)

  const context = await createSessionContext(browser, userAgent, userIdentity.id)
  const page = await context.newPage()

  let fullStoryUrl: string | null = null
  let result: SessionResult

  try {
    // Capture console logs for FullStory URL (silently)
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('fullstory.com') && !fullStoryUrl) {
        const match = text.match(/https:\/\/app\.fullstory\.com[^\s]+/)
        if (match) fullStoryUrl = match[0]
      }
    })

    // Navigate to entry point and wait for FullStory to initialize
    await page.goto(`${options.baseUrl}${entryPoint}`)
    await waitForPageReady(page)

    // Try to capture FullStory URL early
    fullStoryUrl = await captureFullStoryUrl(page)

    // Get test account if needed
    const testAccount = userIdentity.isAuthenticated
      ? TEST_ACCOUNTS.find((a) => a.id === userIdentity.id)
      : undefined

    // Execute the persona behavior
    const personaResult = await executePersona(persona.type, page, testAccount)

    // Try to capture FullStory URL again at the end
    if (!fullStoryUrl) {
      fullStoryUrl = await captureFullStoryUrl(page)
    }

    const duration = Date.now() - startTime

    result = {
      sessionNumber,
      userId: userIdentity.id,
      userAgent: userAgent.name,
      persona: persona.type,
      entryPoint,
      fullStoryUrl,
      authenticated: personaResult.authenticated,
      purchaseCompleted: personaResult.purchaseCompleted,
      pagesVisited: personaResult.pagesVisited,
      duration,
    }

    const status = [
      personaResult.authenticated ? 'auth' : 'guest',
      personaResult.purchaseCompleted ? 'purchased' : 'no-purchase',
    ].join(', ')
    console.log(` done (${(duration / 1000).toFixed(0)}s, ${status})`)
  } catch (error) {
    const duration = Date.now() - startTime
    result = {
      sessionNumber,
      userId: userIdentity.id,
      userAgent: userAgent.name,
      persona: persona.type,
      entryPoint,
      fullStoryUrl: null,
      authenticated: false,
      purchaseCompleted: false,
      pagesVisited: 0,
      duration,
      error: String(error),
    }

    console.log(` FAILED: ${String(error).slice(0, 50)}`)
  } finally {
    await context.close()
  }

  return result
}

/**
 * Main simulator runner
 */
export async function runSimulator(options: SimulatorOptions): Promise<SessionResult[]> {
  console.log(`Starting ${options.totalSessions} sessions...\n`)

  const browser = await chromium.launch({
    headless: options.headless,
    slowMo: options.slowMo,
  })

  const results: SessionResult[] = []

  try {
    for (let i = 1; i <= options.totalSessions; i++) {
      const result = await runSession(browser, i, options)
      results.push(result)

      // Delay between sessions if specified
      if (options.delayBetweenSessions && i < options.totalSessions) {
        await new Promise((resolve) => setTimeout(resolve, options.delayBetweenSessions))
      }
    }
  } finally {
    await browser.close()
  }

  // Print summary and write to file
  printSummary(results)
  writeResultsToFile(results, options)

  return results
}

/**
 * Print session summary
 */
function printSummary(results: SessionResult[]): void {
  console.log('\n' + '='.repeat(80))
  console.log('SESSION SIMULATION SUMMARY')
  console.log('='.repeat(80))

  const successful = results.filter((r) => !r.error)
  const failed = results.filter((r) => r.error)
  const authenticated = results.filter((r) => r.authenticated)
  const purchases = results.filter((r) => r.purchaseCompleted)
  const withFullStory = results.filter((r) => r.fullStoryUrl)

  console.log(`\nTotal Sessions: ${results.length}`)
  console.log(`  Successful: ${successful.length}`)
  console.log(`  Failed: ${failed.length}`)
  console.log(`\nAuthentication:`)
  console.log(`  Authenticated: ${authenticated.length}`)
  console.log(`  Guest: ${results.length - authenticated.length}`)
  console.log(`\nPurchases:`)
  console.log(`  Completed: ${purchases.length}`)
  console.log(`  Abandoned: ${results.length - purchases.length}`)
  console.log(`\nFullStory URLs captured: ${withFullStory.length}`)

  // Persona breakdown
  console.log(`\nPersona Distribution:`)
  const personaCounts: Record<string, number> = {}
  for (const result of results) {
    personaCounts[result.persona] = (personaCounts[result.persona] || 0) + 1
  }
  for (const [persona, count] of Object.entries(personaCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${persona}: ${count}`)
  }

  // User agent breakdown
  console.log(`\nUser Agent Distribution:`)
  const uaCounts: Record<string, number> = {}
  for (const result of results) {
    uaCounts[result.userAgent] = (uaCounts[result.userAgent] || 0) + 1
  }
  for (const [ua, count] of Object.entries(uaCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${ua}: ${count}`)
  }

  // Print FullStory URLs
  if (withFullStory.length > 0) {
    console.log(`\nFullStory Session URLs:`)
    for (const result of withFullStory) {
      console.log(`  Session #${result.sessionNumber} (${result.persona}): ${result.fullStoryUrl}`)
    }
  }

  // Print errors if any
  if (failed.length > 0) {
    console.log(`\nErrors:`)
    for (const result of failed) {
      console.log(`  Session #${result.sessionNumber}: ${result.error}`)
    }
  }

  console.log('\n' + '='.repeat(80))
}

/**
 * Write results to a timestamped log file
 */
function writeResultsToFile(results: SessionResult[], options: SimulatorOptions): void {
  const logsDir = join(__dirname, 'logs')
  mkdirSync(logsDir, {recursive: true})

  const now = new Date()
  const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 16) // YYYY-MM-DD_HH-MM

  const filename = `session-run_${timestamp}.json`
  const filepath = join(logsDir, filename)

  const successful = results.filter((r) => !r.error)
  const authenticated = results.filter((r) => r.authenticated)
  const purchases = results.filter((r) => r.purchaseCompleted)

  const logData = {
    meta: {
      timestamp: now.toISOString(),
      baseUrl: options.baseUrl,
      totalSessions: options.totalSessions,
      personaFilter: options.personaFilter || null,
      headless: options.headless,
    },
    summary: {
      successful: successful.length,
      failed: results.length - successful.length,
      authenticated: authenticated.length,
      guest: results.length - authenticated.length,
      purchasesCompleted: purchases.length,
      purchasesAbandoned: results.length - purchases.length,
      avgDurationSeconds: Math.round(
        results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000,
      ),
    },
    sessions: results.map((r) => ({
      sessionNumber: r.sessionNumber,
      userId: r.userId,
      userAgent: r.userAgent,
      persona: r.persona,
      entryPoint: r.entryPoint,
      fullStoryUrl: r.fullStoryUrl,
      authenticated: r.authenticated,
      purchaseCompleted: r.purchaseCompleted,
      pagesVisited: r.pagesVisited,
      durationSeconds: Math.round(r.duration / 1000),
      error: r.error || null,
    })),
  }

  writeFileSync(filepath, JSON.stringify(logData, null, 2))
  console.log(`\nResults written to: ${filepath}`)
}
