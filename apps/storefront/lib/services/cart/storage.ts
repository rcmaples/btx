import type { Cart, CartLineItem } from '@/lib/types';

const CART_STORAGE_KEY = 'batch-theory-cart';
export const CART_UPDATED_EVENT = 'batch-theory-cart-updated';

export function generateCartId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createEmptyCart(): Cart {
  return {
    id: generateCartId(),
    lineItems: [],
    appliedPromotion: null,
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function loadCartFromStorage(): Cart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return createEmptyCart();
    }

    const parsed = JSON.parse(storedCart) as Cart;

    // Convert date strings back to Date objects
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
    return createEmptyCart();
  }
}

export function saveCartToStorage(cart: Cart): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cartToStore = {
      ...cart,
      updatedAt: new Date(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToStore));
    // Dispatch custom event to sync cart across components
    window.dispatchEvent(
      new CustomEvent(CART_UPDATED_EVENT, { detail: cartToStore })
    );
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

export function clearCartFromStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart from storage:', error);
  }
}

export function calculateCartTotals(
  lineItems: CartLineItem[],
  discount: number
): { subtotal: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = Math.max(0, subtotal - discount);

  return { subtotal, total };
}

export function findLineItem(
  lineItems: CartLineItem[],
  itemId: string
): CartLineItem | undefined {
  return lineItems.find((item) => item.id === itemId);
}

export function addOrUpdateLineItem(
  lineItems: CartLineItem[],
  newItem: CartLineItem
): CartLineItem[] {
  const existingIndex = lineItems.findIndex((item) => item.id === newItem.id);

  if (existingIndex >= 0) {
    // Update existing item quantity
    const updated = [...lineItems];
    const existingItem = updated[existingIndex]!;
    const newQuantity = existingItem.quantity + newItem.quantity;
    updated[existingIndex] = {
      ...existingItem,
      quantity: newQuantity,
      lineTotal: newQuantity * existingItem.pricePerUnit,
    } as CartLineItem;
    return updated;
  }

  // Add new item
  return [...lineItems, newItem];
}

export function removeLineItem(
  lineItems: CartLineItem[],
  itemId: string
): CartLineItem[] {
  return lineItems.filter((item) => item.id !== itemId);
}

export function updateLineItemQuantity(
  lineItems: CartLineItem[],
  itemId: string,
  quantity: number
): CartLineItem[] {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  return lineItems.map((item) =>
    item.id === itemId
      ? {
          ...item,
          quantity,
          lineTotal: quantity * item.pricePerUnit,
        }
      : item
  );
}
