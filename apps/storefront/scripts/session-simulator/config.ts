import type {ContentCatalog, SessionPersona, UserAgent} from './types.js'

export const BASE_URL = 'https://batchtheory.exchange'

// User agents provided by user
export const USER_AGENTS: UserAgent[] = [
  {
    name: 'Chrome 143.0, Windows 10',
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    platform: 'windows',
    browser: 'chrome',
  },
  {
    name: 'Chrome 142.0, Windows 10',
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    platform: 'windows',
    browser: 'chrome',
  },
  {
    name: 'Edge 143.0, Windows 10',
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
    platform: 'windows',
    browser: 'edge',
  },
  {
    name: 'Firefox 145.0, Windows 10',
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
    platform: 'windows',
    browser: 'firefox',
  },
  {
    name: 'Safari 26, macOS',
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
    platform: 'macos',
    browser: 'safari',
  },
  {
    name: 'Chrome 143.0, macOS',
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    platform: 'macos',
    browser: 'chrome',
  },
  {
    name: 'Chrome 142.0, macOS',
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    platform: 'macos',
    browser: 'chrome',
  },
]

// Session personas with probability weights
export const SESSION_PERSONAS: SessionPersona[] = [
  {
    type: 'browser',
    weight: 25,
    requiresAuth: false,
    willPurchase: false,
    description: 'Casually browses products, views 2-4 items, leaves without purchasing',
  },
  {
    type: 'reader',
    weight: 15,
    requiresAuth: false,
    willPurchase: false,
    description: 'Enters via release notes article, reads content, may browse products',
  },
  {
    type: 'impulse-buyer',
    weight: 15,
    requiresAuth: false,
    willPurchase: true,
    description: 'Quick browse, adds item to cart, completes checkout as guest',
  },
  {
    type: 'cart-abandoner',
    weight: 20,
    requiresAuth: false,
    willPurchase: false,
    description: 'Adds items to cart, starts checkout process, abandons before payment',
  },
  {
    type: 'member',
    weight: 45,
    requiresAuth: true,
    willPurchase: true,
    description: 'Logged in member, browses exclusive products, completes purchase',
  },
  {
    type: 'window-shopper',
    weight: 10,
    requiresAuth: false,
    willPurchase: false,
    description: 'Browses bundles extensively, adds to cart, leaves without checkout',
  },
  {
    type: 'deal-seeker',
    weight: 5,
    requiresAuth: false,
    willPurchase: true,
    description: 'Tries promo codes, completes purchase with discount',
  },
  {
    type: 'returning-customer',
    weight: 10,
    requiresAuth: true,
    willPurchase: true,
    description: 'Returning authenticated user, quick purchase flow',
  },
]

// Content catalog from Sanity
export const CONTENT_CATALOG: ContentCatalog = {
  products: [
    {slug: 'brazil-natural', name: 'Brazil - Natural'},
    {slug: 'colombia-huila', name: 'Colombia - Huila'},
    {slug: 'control-variable', name: 'Control Variable'},
    {slug: 'costa-rica-honey-process', name: 'Costa Rica - Honey Process'},
    {slug: 'dark-mode', name: 'Dark Mode'},
    {slug: 'ethiopia-washed', name: 'Ethiopia - Washed'},
    {slug: 'experimental-lot', name: 'Experimental Lot'},
    {slug: 'first-principles', name: 'First Principles'},
    {slug: 'guatemala-huehuetenango', name: 'Guatemala - Huehuetenango'},
    {slug: 'house-method', name: 'House Method'},
    {slug: 'kenya-aa', name: 'Kenya - AA'},
    {slug: 'mexico-chiapas', name: 'Mexico - Chiapas'},
    {slug: 'night-cycle', name: 'Night Cycle'},
    {slug: 'peru-organic', name: 'Peru - Organic'},
    {slug: 'rwanda-bourbon', name: 'Rwanda - Bourbon'},
    {slug: 'second-pass', name: 'Second Pass'},
    {slug: 'sumatra-wet-hulled', name: 'Sumatra - Wet Hulled'},
  ],
  bundles: [
    {slug: 'espresso-stack', name: 'Espresso Stack'},
    {slug: 'filter-theory', name: 'Filter Theory'},
    {slug: 'night-shift', name: 'Night Shift'},
    {slug: 'the-baseline', name: 'The Baseline'},
  ],
  articles: [
    {slug: 'exchange-issue-01', title: 'No Reruns'},
    {slug: 'exchange-issue-02', title: 'Edited, Not Optimized'},
    {slug: 'exchange-issue-03', title: 'The Default Is a Decision'},
    {slug: 'exchange-issue-04', title: 'Comfort Is a Feature'},
    {slug: 'exchange-issue-05', title: "Dark Isn't the Opposite of Care"},
    {slug: 'exchange-issue-06', title: 'Process Leaves a Fingerprint'},
  ],
}

// Test accounts for authenticated sessions (to be populated)
export const TEST_ACCOUNTS = [
  {
    id: 'test-user-1',
    email: 'btx-test-user-1@mailinator.com',
    password: 'TestUser1!Btx2024',
  },
  {
    id: 'test-user-2',
    email: 'btx-test-user-2@mailinator.com',
    password: 'TestUser2!Btx2024',
  },
  {
    id: 'test-user-3',
    email: 'btx-test-user-3@mailinator.com',
    password: 'TestUser3!Btx2024',
  },
]

// Viewport sizes for different devices (sized to fit on most screens)
export const VIEWPORTS = {
  desktop: {width: 1920, height: 1080},
  laptop: {width: 1366, height: 768},
}

// Timing configuration for realistic behavior
export const TIMING = {
  // Page load wait times (ms)
  pageLoadMin: 2000,
  pageLoadMax: 5000,

  // Reading/viewing times (ms)
  quickGlance: {min: 2000, max: 5000},
  readContent: {min: 8000, max: 20000},
  studyProduct: {min: 10000, max: 30000},

  // Interaction delays (ms)
  beforeClick: {min: 500, max: 1500},
  betweenActions: {min: 1000, max: 4000},
  formFieldDelay: {min: 200, max: 600},

  // Scroll behavior
  scrollPauseMin: 1000,
  scrollPauseMax: 4000,

  // Mouse movement
  mouseMoveSteps: {min: 15, max: 40},
  mouseMoveDelay: {min: 10, max: 30},
}
