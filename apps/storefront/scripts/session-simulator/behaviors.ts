import type {Page} from 'playwright'

import {TIMING} from './config.js'

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random delay within a range
 */
export function randomDelay(range: {min: number; max: number}): number {
  return randomInt(range.min, range.max)
}

/**
 * Pick a random item from an array
 */
export function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Pick multiple random items from an array (without replacement)
 */
export function randomPickMultiple<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, items.length))
}

/**
 * Wait for a random amount of time
 */
export async function humanDelay(range: {min: number; max: number}): Promise<void> {
  const delay = randomDelay(range)
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulate human-like mouse movement to an element
 */
export async function humanMouseMove(
  page: Page,
  selector: string,
  options?: {steps?: number},
): Promise<void> {
  const element = await page.$(selector)
  if (!element) return

  const box = await element.boundingBox()
  if (!box) return

  // Get current mouse position (approximate from viewport center if unknown)
  const viewportSize = page.viewportSize()
  const startX = viewportSize ? viewportSize.width / 2 : 500
  const startY = viewportSize ? viewportSize.height / 2 : 400

  // Target position with slight randomization within element
  const targetX = box.x + box.width * (0.3 + Math.random() * 0.4)
  const targetY = box.y + box.height * (0.3 + Math.random() * 0.4)

  const steps = options?.steps ?? randomInt(TIMING.mouseMoveSteps.min, TIMING.mouseMoveSteps.max)

  // Move mouse in steps with slight curve
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    // Add slight bezier curve effect
    const eased = progress * progress * (3 - 2 * progress)

    // Add small random jitter for realism
    const jitterX = (Math.random() - 0.5) * 3
    const jitterY = (Math.random() - 0.5) * 3

    const x = startX + (targetX - startX) * eased + jitterX
    const y = startY + (targetY - startY) * eased + jitterY

    await page.mouse.move(x, y)
    await new Promise((resolve) =>
      setTimeout(resolve, randomInt(TIMING.mouseMoveDelay.min, TIMING.mouseMoveDelay.max)),
    )
  }
}

/**
 * Human-like click with mouse movement
 */
export async function humanClick(page: Page, selector: string): Promise<void> {
  await humanMouseMove(page, selector)
  await humanDelay(TIMING.beforeClick)
  await page.click(selector)
}

/**
 * Human-like form filling with realistic typing speed
 */
export async function humanType(page: Page, selector: string, text: string): Promise<void> {
  await humanClick(page, selector)
  await humanDelay({min: 200, max: 500})

  // Type character by character with variable speed
  for (const char of text) {
    await page.keyboard.type(char, {delay: randomInt(50, 150)})

    // Occasional longer pause (like thinking)
    if (Math.random() < 0.05) {
      await humanDelay({min: 200, max: 500})
    }
  }
}

/**
 * Simulate reading behavior with scrolling
 */
export async function simulateReading(page: Page, duration?: number): Promise<void> {
  const readTime = duration ?? randomDelay(TIMING.readContent)
  const scrollIntervals = Math.floor(readTime / 2000)

  for (let i = 0; i < scrollIntervals; i++) {
    // Scroll down a bit
    const scrollAmount = randomInt(100, 300)
    await page.mouse.wheel(0, scrollAmount)
    await humanDelay({min: TIMING.scrollPauseMin, max: TIMING.scrollPauseMax})
  }

  // Wait remaining time
  const remainingTime = readTime - scrollIntervals * 2000
  if (remainingTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingTime))
  }
}

/**
 * Simulate studying a product page
 */
export async function simulateProductStudy(page: Page): Promise<void> {
  // Scroll through the page
  await simulateReading(page, randomDelay(TIMING.studyProduct))

  // Maybe hover over images
  if (Math.random() < 0.6) {
    const imageSelector = '[data-testid="product-image"], img[alt*="product"], .product-image'
    const images = await page.$$(imageSelector)
    if (images.length > 0) {
      const randomImage = randomPick(images)
      const box = await randomImage.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await humanDelay({min: 1000, max: 2000})
      }
    }
  }
}

/**
 * Wait for page to be ready and FullStory to initialize
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await humanDelay({min: TIMING.pageLoadMin, max: TIMING.pageLoadMax})

  // Wait a bit for FullStory to initialize
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

/**
 * Try to extract FullStory session URL from console logs
 */
export async function captureFullStoryUrl(page: Page): Promise<string | null> {
  try {
    // Try to get FullStory session URL via their API
    const fsUrl = await page.evaluate(() => {
      // @ts-expect-error FullStory global
      if (typeof FS !== 'undefined' && FS.getCurrentSessionURL) {
        // @ts-expect-error FullStory global
        return FS.getCurrentSessionURL(true)
      }
      return null
    })
    return fsUrl
  } catch {
    return null
  }
}

/**
 * Select a random option from a dropdown
 */
export async function selectRandomOption(page: Page, selector: string): Promise<string | null> {
  const select = await page.$(selector)
  if (!select) return null

  const options = await select.$$eval('option', (opts) =>
    opts.map((o) => ({value: o.value, text: o.textContent})).filter((o) => o.value),
  )

  if (options.length === 0) return null

  const randomOption = randomPick(options)
  await humanClick(page, selector)
  await humanDelay({min: 200, max: 500})
  await page.selectOption(selector, randomOption.value)

  return randomOption.value
}

/**
 * Generate a random valid-looking address for checkout
 */
export function generateFakeAddress() {
  const streets = [
    '123 Main St',
    '456 Oak Ave',
    '789 Pine Rd',
    '321 Elm Blvd',
    '654 Maple Dr',
    '987 Cedar Ln',
    '147 Birch Way',
    '258 Willow Ct',
  ]
  const cities = [
    'Austin',
    'Portland',
    'Seattle',
    'Denver',
    'San Francisco',
    'Los Angeles',
    'New York',
    'Chicago',
  ]
  const states = ['TX', 'OR', 'WA', 'CO', 'CA', 'CA', 'NY', 'IL']
  const index = randomInt(0, streets.length - 1)

  return {
    street: streets[index],
    city: cities[index],
    state: states[index],
    zip: String(randomInt(10000, 99999)),
    phone: `${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
  }
}

/**
 * Log with timestamp
 */
export function log(message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[${timestamp}] ${message}`, data)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}
