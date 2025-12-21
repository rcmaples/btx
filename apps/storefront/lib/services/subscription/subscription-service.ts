import type {
  Subscription,
  SubscriptionService,
  Cart,
  PurchaseSelection,
  CartLineItem,
} from '@/lib/types';
import { generateCartItemId } from '@/lib/types';
import { cartService } from '../cart/cart-service';

class SubscriptionServiceImpl implements SubscriptionService {
  /**
   * Create subscription configuration from purchase selection
   */
  createSubscription(
    selection: PurchaseSelection,
    cadence: Subscription['cadence']
  ): Subscription {
    if (!selection.productId) {
      throw new Error('Product selection is required');
    }

    if (!['weekly', 'bi-weekly', 'monthly'].includes(cadence)) {
      throw new Error('Invalid cadence. Must be weekly, bi-weekly, or monthly');
    }

    // Generate unique subscription ID
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const subscription: Subscription = {
      id: subscriptionId,
      productId: selection.productId,
      productName: selection.productName,
      sizeKey: selection.sizeKey,
      sizeName: selection.sizeName,
      grams: selection.grams,
      grind: selection.grind,
      cadence,
      recurringPrice: selection.priceInCents,
    };

    return subscription;
  }

  /**
   * Add subscription to cart
   * Creates a subscription line item from the subscription data
   */
  async addSubscriptionToCart(subscription: Subscription): Promise<Cart> {
    // Get current cart
    const cart = cartService.getCart();

    // Generate item ID for the subscription
    const itemId = `sub-${generateCartItemId(subscription.productId, subscription.sizeKey, subscription.grind)}`;

    // Create subscription line item
    const subscriptionItem: CartLineItem = {
      id: itemId,
      productId: subscription.productId,
      productName: subscription.productName,
      sizeKey: subscription.sizeKey,
      sizeName: subscription.sizeName,
      grams: subscription.grams,
      grind: subscription.grind,
      quantity: 1, // Subscriptions always have quantity 1
      pricePerUnit: subscription.recurringPrice,
      lineTotal: subscription.recurringPrice,
      itemType: 'subscription' as const,
      subscriptionDetails: {
        cadence: subscription.cadence,
        recurringPrice: subscription.recurringPrice,
      },
    };

    // Check if this subscription already exists in cart
    const existingIndex = cart.lineItems.findIndex(
      (item) => item.id === itemId
    );

    let updatedLineItems;
    if (existingIndex >= 0) {
      // Replace existing subscription with new cadence
      updatedLineItems = cart.lineItems.map((item, index) =>
        index === existingIndex ? subscriptionItem : item
      );
    } else {
      updatedLineItems = [...cart.lineItems, subscriptionItem];
    }

    // Recalculate totals
    const subtotal = updatedLineItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const total = Math.max(0, subtotal - cart.discount);

    const updatedCart: Cart = {
      ...cart,
      lineItems: updatedLineItems,
      subtotal,
      total,
      updatedAt: new Date(),
    };

    cartService.persistCart(updatedCart);
    return updatedCart;
  }
}

export const subscriptionService = new SubscriptionServiceImpl();
