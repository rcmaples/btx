import {beforeEach, vi} from 'vitest'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
}

// Mock window.dispatchEvent for CART_UPDATED_EVENT
const dispatchEventMock = vi.fn()

// Setup window with mocks
Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: localStorageMock,
    dispatchEvent: dispatchEventMock,
    CustomEvent: class CustomEvent extends Event {
      detail: unknown
      constructor(type: string, options?: {detail?: unknown}) {
        super(type)
        this.detail = options?.detail
      }
    },
  },
  writable: true,
})

// Also expose localStorage at global level for SSR checks
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.store = {}
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  dispatchEventMock.mockClear()
})

export {localStorageMock, dispatchEventMock}
