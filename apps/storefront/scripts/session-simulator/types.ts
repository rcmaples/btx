export interface UserAgent {
  name: string
  value: string
  platform: 'windows' | 'macos'
  browser: 'chrome' | 'firefox' | 'safari' | 'edge'
}

export interface UserIdentity {
  id: string
  email?: string
  password?: string
  isAuthenticated: boolean
  storagePath?: string
}

export type PersonaType =
  | 'browser'
  | 'reader'
  | 'impulse-buyer'
  | 'cart-abandoner'
  | 'member'
  | 'window-shopper'
  | 'deal-seeker'
  | 'returning-customer'

export interface SessionPersona {
  type: PersonaType
  weight: number // Probability weight for random selection
  requiresAuth: boolean
  willPurchase: boolean
  description: string
}

export interface SessionConfig {
  persona: SessionPersona
  userAgent: UserAgent
  userIdentity: UserIdentity
  entryPoint: string
}

export interface SessionResult {
  sessionNumber: number
  userId: string
  userAgent: string
  persona: PersonaType
  entryPoint: string
  fullStoryUrl: string | null
  authenticated: boolean
  purchaseCompleted: boolean
  pagesVisited: number
  duration: number
  error?: string
}

export interface SimulatorOptions {
  baseUrl: string
  totalSessions: number
  headless: boolean
  slowMo?: number
  delayBetweenSessions?: number
  personaFilter?: string
}

export interface ProductInfo {
  slug: string
  name: string
}

export interface BundleInfo {
  slug: string
  name: string
}

export interface ArticleInfo {
  slug: string
  title: string
}

export interface ContentCatalog {
  products: ProductInfo[]
  bundles: BundleInfo[]
  articles: ArticleInfo[]
}
