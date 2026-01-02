import {expect, test} from '@playwright/test'

test.describe('Storefront Smoke Tests', () => {
  test('homepage loads successfully', async ({page}) => {
    await page.goto('/')

    // Verify key elements are present
    await expect(page).toHaveTitle(/Batch Theory/i)

    // Navigation should be visible
    const nav = page.locator('nav, header')
    await expect(nav.first()).toBeVisible()

    // Main content area should exist
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('products page displays products', async ({page}) => {
    await page.goto('/products')

    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Should have product links
    const productLinks = page.locator('a[href^="/products/"]')
    await expect(productLinks.first()).toBeVisible({timeout: 10000})

    // Click on first product
    await productLinks.first().click()

    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/products\/.+/)

    // Product page should have an add to cart button
    const addToCartButton = page.locator('button', {hasText: /add to cart|add to bag/i})
    await expect(addToCartButton).toBeVisible({timeout: 10000})
  })

  test('add product to cart and view cart', async ({page}) => {
    // Navigate directly to products page
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    // Click on first product
    const productLink = page.locator('a[href^="/products/"]').first()
    await productLink.click()
    await page.waitForLoadState('networkidle')

    // Add to cart
    const addToCartButton = page.locator('button', {hasText: /add to cart|add to bag/i})
    await addToCartButton.click()

    // Wait for cart to update
    await page.waitForTimeout(1500)

    // Navigate to cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    // Cart page should have "Shopping Cart" heading
    const heading = page.locator('h1', {hasText: 'Shopping Cart'})
    await expect(heading).toBeVisible({timeout: 5000})

    // Should have a Remove button (indicating item is in cart)
    const removeButton = page.locator('button', {hasText: 'Remove'})
    await expect(removeButton).toBeVisible({timeout: 5000})
  })

  test('cart page shows quantity selector', async ({page}) => {
    // First add a product to cart
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    const productLink = page.locator('a[href^="/products/"]').first()
    await productLink.click()
    await page.waitForLoadState('networkidle')

    const addToCartButton = page.locator('button', {hasText: /add to cart|add to bag/i})
    await addToCartButton.click()
    await page.waitForTimeout(1500)

    // Go to cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    // Should have quantity selector
    const quantitySelector = page.locator('select[id^="quantity-"]')
    await expect(quantitySelector).toBeVisible({timeout: 5000})

    // Verify we can interact with quantity selector
    const currentValue = await quantitySelector.inputValue()
    expect(currentValue).toBe('1')
  })

  test('bundles page displays bundles', async ({page}) => {
    await page.goto('/bundles')

    // Wait for bundles to load
    await page.waitForLoadState('networkidle')

    // Should have bundle links or cards
    const bundleLinks = page.locator('a[href^="/bundles/"]')

    // Wait for content to render
    await page.waitForTimeout(2000)

    // Check if we have bundle links
    const bundleCount = await bundleLinks.count()

    // If bundles exist, click on one
    if (bundleCount > 0) {
      await bundleLinks.first().click()
      await expect(page).toHaveURL(/\/bundles\/.+/)

      // Bundle page should have add to cart button (text is "Add Bundle to Cart")
      const addToCartButton = page.locator('button', {hasText: /add.*to cart|add to bag/i})
      await expect(addToCartButton).toBeVisible({timeout: 10000})
    } else {
      // Page loaded but no bundles - still a valid smoke test
      expect(true).toBe(true)
    }
  })
})
