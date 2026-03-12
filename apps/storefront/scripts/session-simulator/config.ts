import type {ContentCatalog, GeoLocation, SessionPersona, UserAgent} from './types.js'

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

// City geolocation data for browser context emulation.
// spoofedIp is a representative publicly-routable ISP IP for the city/country,
// injected as X-Forwarded-For on all browser requests (including FullStory beacons)
// so that FullStory's IP-based geolocation resolves to the correct region.
export const GEOLOCATIONS: GeoLocation[] = [
  // North America
  {
    city: 'Atlanta, GA',
    latitude: 33.749,
    longitude: -84.388,
    timezone: 'America/New_York',
    spoofedIp: '74.125.71.1',
  },
  {
    city: 'Boston, MA',
    latitude: 42.361,
    longitude: -71.057,
    timezone: 'America/New_York',
    spoofedIp: '66.228.49.1',
  },
  {
    city: 'New York, NY',
    latitude: 40.713,
    longitude: -74.006,
    timezone: 'America/New_York',
    spoofedIp: '72.229.28.185',
  },
  {
    city: 'Dallas, TX',
    latitude: 32.776,
    longitude: -96.797,
    timezone: 'America/Chicago',
    spoofedIp: '99.167.147.1',
  },
  {
    city: 'San Francisco, CA',
    latitude: 37.774,
    longitude: -122.419,
    timezone: 'America/Los_Angeles',
    spoofedIp: '76.102.97.1',
  },
  {
    city: 'Seattle, WA',
    latitude: 47.606,
    longitude: -122.332,
    timezone: 'America/Los_Angeles',
    spoofedIp: '73.239.120.1',
  },
  {
    city: 'Portland, OR',
    latitude: 45.523,
    longitude: -122.676,
    timezone: 'America/Los_Angeles',
    spoofedIp: '73.34.15.1',
  },
  {
    city: 'Chicago, IL',
    latitude: 41.878,
    longitude: -87.63,
    timezone: 'America/Chicago',
    spoofedIp: '98.231.198.1',
  },
  {
    city: 'Honolulu, HI',
    latitude: 21.307,
    longitude: -157.858,
    timezone: 'Pacific/Honolulu',
    spoofedIp: '66.90.115.1',
  },
  {
    city: 'Hershey, PA',
    latitude: 40.286,
    longitude: -76.65,
    timezone: 'America/New_York',
    spoofedIp: '71.182.195.1',
  },
  // Europe
  {
    city: 'Paris, France',
    latitude: 48.857,
    longitude: 2.347,
    timezone: 'Europe/Paris',
    spoofedIp: '90.63.212.1',
  },
  {
    city: 'London, UK',
    latitude: 51.507,
    longitude: -0.128,
    timezone: 'Europe/London',
    spoofedIp: '86.19.209.1',
  },
  {
    city: 'Glasgow, Scotland',
    latitude: 55.864,
    longitude: -4.252,
    timezone: 'Europe/London',
    spoofedIp: '86.150.64.1',
  },
  {
    city: 'Galway, Ireland',
    latitude: 53.274,
    longitude: -9.049,
    timezone: 'Europe/Dublin',
    spoofedIp: '87.44.10.1',
  },
  {
    city: 'Madrid, Spain',
    latitude: 40.416,
    longitude: -3.703,
    timezone: 'Europe/Madrid',
    spoofedIp: '80.58.61.1',
  },
  {
    city: 'Berlin, Germany',
    latitude: 52.52,
    longitude: 13.405,
    timezone: 'Europe/Berlin',
    spoofedIp: '84.44.176.1',
  },
  {
    city: 'Munich, Germany',
    latitude: 48.137,
    longitude: 11.576,
    timezone: 'Europe/Berlin',
    spoofedIp: '84.44.200.1',
  },
  {
    city: 'Lisbon, Portugal',
    latitude: 38.717,
    longitude: -9.139,
    timezone: 'Europe/Lisbon',
    spoofedIp: '94.63.10.1',
  },
  {
    city: 'Rome, Italy',
    latitude: 41.902,
    longitude: 12.496,
    timezone: 'Europe/Rome',
    spoofedIp: '79.2.15.1',
  },
  // Latin America
  {
    city: 'Mexico City, Mexico',
    latitude: 19.433,
    longitude: -99.133,
    timezone: 'America/Mexico_City',
    spoofedIp: '187.188.1.1',
  },
  {
    city: 'Rio de Janeiro, Brazil',
    latitude: -22.907,
    longitude: -43.173,
    timezone: 'America/Sao_Paulo',
    spoofedIp: '187.20.10.1',
  },
  {
    city: 'San Jose, Costa Rica',
    latitude: 9.934,
    longitude: -84.088,
    timezone: 'America/Costa_Rica',
    spoofedIp: '190.7.15.1',
  },
  {
    city: 'Sao Paulo, Brazil',
    latitude: -23.549,
    longitude: -46.633,
    timezone: 'America/Sao_Paulo',
    spoofedIp: '177.72.1.1',
  },
  {
    city: 'Buenos Aires, Argentina',
    latitude: -34.604,
    longitude: -58.382,
    timezone: 'America/Argentina/Buenos_Aires',
    spoofedIp: '190.194.1.1',
  },
  // Africa & Middle East
  {
    city: 'Cairo, Egypt',
    latitude: 30.045,
    longitude: 31.236,
    timezone: 'Africa/Cairo',
    spoofedIp: '197.32.1.1',
  },
  {
    city: 'Tel Aviv, Israel',
    latitude: 32.087,
    longitude: 34.79,
    timezone: 'Asia/Jerusalem',
    spoofedIp: '84.94.18.1',
  },
  {
    city: 'Lagos, Nigeria',
    latitude: 6.524,
    longitude: 3.379,
    timezone: 'Africa/Lagos',
    spoofedIp: '197.255.0.1',
  },
  {
    city: 'Johannesburg, South Africa',
    latitude: -26.195,
    longitude: 28.034,
    timezone: 'Africa/Johannesburg',
    spoofedIp: '196.14.1.1',
  },
  {
    city: 'Nairobi, Kenya',
    latitude: -1.286,
    longitude: 36.818,
    timezone: 'Africa/Nairobi',
    spoofedIp: '197.136.1.1',
  },
  // Oceania
  {
    city: 'Auckland, New Zealand',
    latitude: -36.848,
    longitude: 174.763,
    timezone: 'Pacific/Auckland',
    spoofedIp: '122.61.1.1',
  },
  {
    city: 'Christchurch, New Zealand',
    latitude: -43.533,
    longitude: 172.637,
    timezone: 'Pacific/Auckland',
    spoofedIp: '125.236.1.1',
  },
  {
    city: 'Sydney, Australia',
    latitude: -33.869,
    longitude: 151.209,
    timezone: 'Australia/Sydney',
    spoofedIp: '121.222.1.1',
  },
  {
    city: 'Melbourne, Australia',
    latitude: -37.814,
    longitude: 144.963,
    timezone: 'Australia/Melbourne',
    spoofedIp: '203.206.1.1',
  },
  {
    city: 'Brisbane, Australia',
    latitude: -27.468,
    longitude: 153.028,
    timezone: 'Australia/Brisbane',
    spoofedIp: '58.162.1.1',
  },
  {
    city: 'Perth, Australia',
    latitude: -31.954,
    longitude: 115.861,
    timezone: 'Australia/Perth',
    spoofedIp: '59.167.1.1',
  },
  {
    city: 'Adelaide, Australia',
    latitude: -34.928,
    longitude: 138.601,
    timezone: 'Australia/Adelaide',
    spoofedIp: '60.240.1.1',
  },
  // Asia
  {
    city: 'Tokyo, Japan',
    latitude: 35.69,
    longitude: 139.692,
    timezone: 'Asia/Tokyo',
    spoofedIp: '126.0.1.1',
  },
  {
    city: 'Yokohama, Japan',
    latitude: 35.444,
    longitude: 139.638,
    timezone: 'Asia/Tokyo',
    spoofedIp: '126.96.1.1',
  },
  {
    city: 'Kyoto, Japan',
    latitude: 35.012,
    longitude: 135.768,
    timezone: 'Asia/Tokyo',
    spoofedIp: '126.64.1.1',
  },
  {
    city: 'Manila, Philippines',
    latitude: 14.599,
    longitude: 120.984,
    timezone: 'Asia/Manila',
    spoofedIp: '112.198.1.1',
  },
  {
    city: 'Singapore',
    latitude: 1.352,
    longitude: 103.82,
    timezone: 'Asia/Singapore',
    spoofedIp: '116.86.1.1',
  },
]

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
