import type {Page} from 'playwright'

import {
  generateFakeAddress,
  humanClick,
  humanDelay,
  humanType,
  log,
  randomInt,
  randomPick,
  randomPickMultiple,
  simulateProductStudy,
  simulateReading,
  waitForPageReady,
} from './behaviors.js'
import type {TEST_ACCOUNTS} from './config.js'
import {BASE_URL, CONTENT_CATALOG} from './config.js'
import type {PersonaType, SessionResult} from './types.js'

interface PersonaContext {
  page: Page
  pagesVisited: number
  authenticated: boolean
  purchaseCompleted: boolean
  testAccount?: (typeof TEST_ACCOUNTS)[0]
}

/**
 * Execute the browser persona - casual product browsing
 */
export async function executeBrowserPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Start at products page
  await page.goto(`${BASE_URL}/products`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  // Browse 3-6 random products
  const productsToView = randomPickMultiple(CONTENT_CATALOG.products, randomInt(3, 6))

  for (const product of productsToView) {
    await simulateReading(page, randomInt(2000, 4000))

    // Click on product
    const productLink = `a[href="/products/${product.slug}"]`
    try {
      await humanClick(page, productLink)
      await waitForPageReady(page)
      ctx.pagesVisited++

      // Study the product
      await simulateProductStudy(page)

      // Go back to products listing
      await page.goBack()
      await waitForPageReady(page)
    } catch {
      // Product link not found, continue
      log(`Could not find product link: ${product.slug}`)
    }
  }

  // Maybe visit one more page before leaving
  if (Math.random() < 0.3) {
    await page.goto(`${BASE_URL}/bundles`)
    await waitForPageReady(page)
    ctx.pagesVisited++
    await simulateReading(page)
  }
}

/**
 * Execute the reader persona - enters via release notes
 */
export async function executeReaderPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Start at a random article
  const article = randomPick(CONTENT_CATALOG.articles)
  await page.goto(`${BASE_URL}/release-notes/${article.slug}`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  // Read the article thoroughly
  await simulateReading(page, randomInt(15000, 40000))

  // Maybe browse to another article
  if (Math.random() < 0.4) {
    await page.goto(`${BASE_URL}/release-notes`)
    await waitForPageReady(page)
    ctx.pagesVisited++

    const anotherArticle = randomPick(
      CONTENT_CATALOG.articles.filter((a) => a.slug !== article.slug),
    )
    await humanClick(page, `a[href="/release-notes/${anotherArticle.slug}"]`)
    await waitForPageReady(page)
    ctx.pagesVisited++
    await simulateReading(page, randomInt(5000, 12000))
  }

  // Maybe browse products after reading
  if (Math.random() < 0.5) {
    await page.goto(`${BASE_URL}/products`)
    await waitForPageReady(page)
    ctx.pagesVisited++
    await simulateReading(page, randomInt(3000, 6000))

    // View one product
    const product = randomPick(CONTENT_CATALOG.products)
    try {
      await humanClick(page, `a[href="/products/${product.slug}"]`)
      await waitForPageReady(page)
      ctx.pagesVisited++
      await simulateProductStudy(page)
    } catch {
      // Continue if product not found
    }
  }
}

/**
 * Execute the impulse buyer persona - quick purchase
 */
export async function executeImpulseBuyerPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Start at home or products
  const startPage = Math.random() < 0.5 ? '' : '/products'
  await page.goto(`${BASE_URL}${startPage}`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  // Quick browse
  await simulateReading(page, randomInt(2000, 4000))

  // Go to a product
  const product = randomPick(CONTENT_CATALOG.products)
  await page.goto(`${BASE_URL}/products/${product.slug}`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  // Quick look at product
  await simulateReading(page, randomInt(3000, 6000))

  // Add to cart
  await addProductToCart(page)

  // Go to cart
  await page.goto(`${BASE_URL}/cart`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  // Quick review
  await humanDelay({min: 1000, max: 2000})

  // Proceed to checkout
  await completeCheckout(page, ctx)
}

/**
 * Execute the cart abandoner persona
 */
export async function executeCartAbandonerPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Browse products
  await page.goto(`${BASE_URL}/products`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateReading(page, randomInt(3000, 5000))

  // View and add 1-2 products
  const productsToAdd = randomPickMultiple(CONTENT_CATALOG.products, randomInt(1, 2))

  for (const product of productsToAdd) {
    await page.goto(`${BASE_URL}/products/${product.slug}`)
    await waitForPageReady(page)
    ctx.pagesVisited++
    await simulateProductStudy(page)
    await addProductToCart(page)
  }

  // Go to cart
  await page.goto(`${BASE_URL}/cart`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateReading(page, randomInt(2000, 4000))

  // Maybe start checkout but abandon
  if (Math.random() < 0.6) {
    try {
      // Try to find and click checkout button
      const checkoutBtn = await page.$('a[href="/checkout"], button:has-text("Checkout")')
      if (checkoutBtn) {
        await humanClick(page, 'a[href="/checkout"], button:has-text("Checkout")')
        await waitForPageReady(page)
        ctx.pagesVisited++

        // Fill partial form then abandon
        await humanDelay({min: 2000, max: 5000})
      }
    } catch {
      // Checkout not available
    }
  }

  // Abandon - just leave (maybe browse one more page)
  if (Math.random() < 0.3) {
    await page.goto(`${BASE_URL}/`)
    await waitForPageReady(page)
    ctx.pagesVisited++
    await humanDelay({min: 1000, max: 3000})
  }
}

/**
 * Execute the member persona - authenticated purchase
 */
export async function executeMemberPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Login first
  await page.goto(`${BASE_URL}/login`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  if (ctx.testAccount) {
    await performLogin(page, ctx.testAccount.email, ctx.testAccount.password)
    ctx.authenticated = true
  }

  await humanDelay({min: 2000, max: 4000})

  // Visit profile briefly
  await page.goto(`${BASE_URL}/profile`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await humanDelay({min: 1000, max: 2000})

  // Browse products
  await page.goto(`${BASE_URL}/products`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateReading(page, randomInt(3000, 6000))

  // View a product
  const product = randomPick(CONTENT_CATALOG.products)
  await page.goto(`${BASE_URL}/products/${product.slug}`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateProductStudy(page)

  // Add to cart
  await addProductToCart(page)

  // Go to cart and checkout
  await page.goto(`${BASE_URL}/cart`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  await completeCheckout(page, ctx)
}

/**
 * Execute the window shopper persona - browses bundles
 */
export async function executeWindowShopperPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Start at bundles
  await page.goto(`${BASE_URL}/bundles`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateReading(page, randomInt(3000, 5000))

  // View 2-4 bundles
  const bundlesToView = randomPickMultiple(CONTENT_CATALOG.bundles, randomInt(2, 4))

  for (const bundle of bundlesToView) {
    try {
      await humanClick(page, `a[href="/bundles/${bundle.slug}"]`)
      await waitForPageReady(page)
      ctx.pagesVisited++
      await simulateProductStudy(page)
      await page.goBack()
      await waitForPageReady(page)
    } catch {
      // Bundle not found, continue
    }
  }

  // Add one bundle to cart
  const bundleToAdd = randomPick(CONTENT_CATALOG.bundles)
  await page.goto(`${BASE_URL}/bundles/${bundleToAdd.slug}`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await addProductToCart(page)

  // View cart but don't checkout
  await page.goto(`${BASE_URL}/cart`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateReading(page, randomInt(3000, 6000))

  // Leave
}

/**
 * Execute the deal seeker persona - tries promo codes
 */
export async function executeDealSeekerPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Go straight to a product
  const product = randomPick(CONTENT_CATALOG.products)
  await page.goto(`${BASE_URL}/products/${product.slug}`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await simulateReading(page, randomInt(2000, 4000))

  // Add to cart
  await addProductToCart(page)

  // Go to cart
  await page.goto(`${BASE_URL}/cart`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  // Try promo codes
  const promoCodes = ['SAVE10', 'WELCOME', 'COFFEE20', 'INVALID123']
  for (const code of randomPickMultiple(promoCodes, 2)) {
    try {
      const promoInput = await page.$('input[name="promoCode"], input[placeholder*="promo" i]')
      if (promoInput) {
        await humanType(page, 'input[name="promoCode"], input[placeholder*="promo" i]', code)
        await humanDelay({min: 500, max: 1000})

        // Try to apply
        const applyBtn = await page.$('button:has-text("Apply")')
        if (applyBtn) {
          await humanClick(page, 'button:has-text("Apply")')
          await humanDelay({min: 1000, max: 2000})
        }
      }
    } catch {
      // Promo code input not found
    }
  }

  // Complete checkout
  await completeCheckout(page, ctx)
}

/**
 * Execute the returning customer persona
 */
export async function executeReturningCustomerPersona(ctx: PersonaContext): Promise<void> {
  const {page} = ctx

  // Login
  await page.goto(`${BASE_URL}/login`)
  await waitForPageReady(page)
  ctx.pagesVisited++

  if (ctx.testAccount) {
    await performLogin(page, ctx.testAccount.email, ctx.testAccount.password)
    ctx.authenticated = true
  }

  await humanDelay({min: 1000, max: 2000})

  // Quick product selection (knows what they want)
  const product = randomPick(CONTENT_CATALOG.products)
  await page.goto(`${BASE_URL}/products/${product.slug}`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await humanDelay({min: 2000, max: 4000})

  // Add to cart
  await addProductToCart(page)

  // Fast checkout
  await page.goto(`${BASE_URL}/cart`)
  await waitForPageReady(page)
  ctx.pagesVisited++
  await humanDelay({min: 1000, max: 2000})

  await completeCheckout(page, ctx)
}

/**
 * Helper: Add current product to cart
 */
async function addProductToCart(page: Page): Promise<void> {
  try {
    // Try to select size if available
    const sizeSelector = await page.$('select[name="size"], [data-testid="size-selector"]')
    if (sizeSelector) {
      await humanClick(page, 'select[name="size"], [data-testid="size-selector"]')
      await humanDelay({min: 300, max: 600})
      // Select first available option
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
    }

    // Try to select grind if available
    const grindSelector = await page.$('select[name="grind"], [data-testid="grind-selector"]')
    if (grindSelector) {
      await humanClick(page, 'select[name="grind"], [data-testid="grind-selector"]')
      await humanDelay({min: 300, max: 600})
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
    }

    await humanDelay({min: 500, max: 1000})

    // Click add to cart
    const addToCartBtn = await page.$(
      'button:has-text("Add to Cart"), button:has-text("Add to Bag")',
    )
    if (addToCartBtn) {
      await humanClick(page, 'button:has-text("Add to Cart"), button:has-text("Add to Bag")')
      await humanDelay({min: 1000, max: 2000})
    }
  } catch (e) {
    log('Error adding to cart', {error: String(e)})
  }
}

/**
 * Helper: Perform login
 */
async function performLogin(page: Page, email: string, password: string): Promise<void> {
  try {
    // Wait for Clerk form to load
    await humanDelay({min: 1000, max: 2000})

    // Type email
    const emailInput = await page.$('input[name="identifier"], input[type="email"]')
    if (emailInput) {
      await humanType(page, 'input[name="identifier"], input[type="email"]', email)
      await humanDelay({min: 500, max: 1000})

      // Click continue
      const continueBtn = await page.$('button:has-text("Continue")')
      if (continueBtn) {
        await humanClick(page, 'button:has-text("Continue")')
        await humanDelay({min: 1000, max: 2000})
      }

      // Type password
      const passwordInput = await page.$('input[type="password"]')
      if (passwordInput) {
        await humanType(page, 'input[type="password"]', password)
        await humanDelay({min: 500, max: 1000})

        // Click sign in
        const signInBtn = await page.$('button:has-text("Sign in"), button:has-text("Continue")')
        if (signInBtn) {
          await humanClick(page, 'button:has-text("Sign in"), button:has-text("Continue")')
          await waitForPageReady(page)
        }
      }
    }
  } catch (e) {
    log('Error during login', {error: String(e)})
  }
}

/**
 * Helper: Complete checkout process
 */
async function completeCheckout(page: Page, ctx: PersonaContext): Promise<void> {
  try {
    // Click checkout button
    const checkoutBtn = await page.$(
      'a[href="/checkout"], button:has-text("Checkout"), button:has-text("Proceed")',
    )
    if (checkoutBtn) {
      await humanClick(
        page,
        'a[href="/checkout"], button:has-text("Checkout"), button:has-text("Proceed")',
      )
      await waitForPageReady(page)
      ctx.pagesVisited++
    } else {
      // Already on checkout or can't find button
      await page.goto(`${BASE_URL}/checkout`)
      await waitForPageReady(page)
      ctx.pagesVisited++
    }

    // Fill shipping address
    const address = generateFakeAddress()

    // Common form field selectors
    const fields = [
      {selector: 'input[name="streetAddress"], input[name="address"]', value: address.street},
      {
        selector: 'input[name="city"], input[placeholder*="city" i]',
        value: address.city,
      },
      {
        selector: 'input[name="state"], input[placeholder*="state" i], select[name="state"]',
        value: address.state,
      },
      {
        selector: 'input[name="postalCode"], input[name="zip"], input[placeholder*="zip" i]',
        value: address.zip,
      },
      {
        selector: 'input[name="phone"], input[type="tel"]',
        value: address.phone,
      },
    ]

    for (const field of fields) {
      try {
        const input = await page.$(field.selector)
        if (input) {
          // Check if it's a select element
          const tagName = await input.evaluate((el) => el.tagName.toLowerCase())
          if (tagName === 'select') {
            await page.selectOption(field.selector, {label: field.value})
          } else {
            await humanType(page, field.selector, field.value)
          }
          await humanDelay({min: 300, max: 600})
        }
      } catch {
        // Field not found, continue
      }
    }

    await humanDelay({min: 1000, max: 2000})

    // Look for payment/submit button - in test mode, payment is pre-filled
    const submitSelectors = [
      'button:has-text("Place Order")',
      'button:has-text("Complete Order")',
      'button:has-text("Pay")',
      'button:has-text("Submit")',
      'button[type="submit"]',
    ]

    for (const selector of submitSelectors) {
      const submitBtn = await page.$(selector)
      if (submitBtn) {
        await humanClick(page, selector)
        await humanDelay({min: 2000, max: 4000})
        ctx.purchaseCompleted = true
        break
      }
    }

    // Wait for confirmation or error
    await humanDelay({min: 2000, max: 3000})
  } catch (e) {
    log('Error during checkout', {error: String(e)})
  }
}

/**
 * Execute persona based on type
 */
export async function executePersona(
  personaType: PersonaType,
  page: Page,
  testAccount?: (typeof TEST_ACCOUNTS)[0],
): Promise<Pick<SessionResult, 'pagesVisited' | 'authenticated' | 'purchaseCompleted'>> {
  const ctx: PersonaContext = {
    page,
    pagesVisited: 0,
    authenticated: false,
    purchaseCompleted: false,
    testAccount,
  }

  switch (personaType) {
    case 'browser':
      await executeBrowserPersona(ctx)
      break
    case 'reader':
      await executeReaderPersona(ctx)
      break
    case 'impulse-buyer':
      await executeImpulseBuyerPersona(ctx)
      break
    case 'cart-abandoner':
      await executeCartAbandonerPersona(ctx)
      break
    case 'member':
      await executeMemberPersona(ctx)
      break
    case 'window-shopper':
      await executeWindowShopperPersona(ctx)
      break
    case 'deal-seeker':
      await executeDealSeekerPersona(ctx)
      break
    case 'returning-customer':
      await executeReturningCustomerPersona(ctx)
      break
  }

  return {
    pagesVisited: ctx.pagesVisited,
    authenticated: ctx.authenticated,
    purchaseCompleted: ctx.purchaseCompleted,
  }
}
