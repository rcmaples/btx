'use client';

import { useState, useEffect, useCallback } from 'react';
import { cartService } from '@/lib/services/cart/cart-service';
import { CART_UPDATED_EVENT, createEmptyCart } from '@/lib/services/cart/storage';
import type { Cart, PurchaseSelection } from '@/lib/types';

export function useCart() {
  // SSR guard: use empty cart on server, load from localStorage on client
  const [cart, setCart] = useState<Cart>(() => {
    if (typeof window === 'undefined') {
      return createEmptyCart();
    }
    return cartService.getCart();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration - load cart from localStorage after mount
  useEffect(() => {
    setMounted(true);
    setCart(cartService.getCart());
  }, []);

  // Sync cart state across all components using this hook
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent<Cart>) => {
      setCart({
        ...event.detail,
        createdAt: new Date(event.detail.createdAt),
        updatedAt: new Date(event.detail.updatedAt),
      });
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate as EventListener);
    };
  }, []);

  const addToCart = useCallback(
    async (selection: PurchaseSelection, quantity: number = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await cartService.addToCart(selection, quantity);
        setCart(updatedCart);
        return updatedCart;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to add to cart'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addBundleToCart = useCallback(
    async (bundle: {
      _id: string;
      name: string;
      price: number;
      grind?: string;
      products: Array<{ _id: string; name: string }>;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await cartService.addBundleToCart(bundle);
        setCart(updatedCart);
        return updatedCart;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to add bundle to cart'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    setError(null);

    try {
      const updatedCart = cartService.removeFromCart(itemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove from cart'));
      throw err;
    }
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setError(null);

    try {
      const updatedCart = cartService.updateQuantity(itemId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update quantity'));
      throw err;
    }
  }, []);

  const clearCart = useCallback(() => {
    setError(null);

    try {
      const updatedCart = cartService.clearCart();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear cart'));
      throw err;
    }
  }, []);

  const applyPromoCode = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartService.applyPromoCode(code);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to apply promo code'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePromotion = useCallback(() => {
    setError(null);

    try {
      const updatedCart = cartService.removePromotion();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove promotion'));
      throw err;
    }
  }, []);

  const validateInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const outOfStockIds = await cartService.validateInventory();
      return outOfStockIds;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to validate inventory'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate item count (returns 0 before hydration to prevent mismatch)
  const itemCount = mounted
    ? cart.lineItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return {
    cart,
    itemCount,
    isLoading,
    error,
    mounted,
    addToCart,
    addBundleToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromoCode,
    removePromotion,
    validateInventory,
  };
}
