import type {
  Bundle,
  BundleProduct,
  BundleService,
  Cart,
  SanityBundle,
  CartLineItem,
} from '@/lib/types';
import { generateCartItemId } from '@/lib/types';
import { cartService } from '../cart/cart-service';
import {
  getBundles,
  getBundleBySlug,
  getBundlesClient,
  getBundleBySlugClient,
} from '../sanity/queries';

class BundleServiceImpl implements BundleService {
  // Server-side fetch methods (use sanityFetch with Next.js cache)
  async getBundles(filters?: { isMember?: boolean }): Promise<SanityBundle[]> {
    return getBundles(filters);
  }

  async getBundleBySlug(slug: string): Promise<SanityBundle | null> {
    return getBundleBySlug(slug);
  }

  // Client-safe fetch methods (use clientFetch without Next.js cache)
  async getBundlesClient(filters?: {
    isMember?: boolean;
  }): Promise<SanityBundle[]> {
    return getBundlesClient(filters);
  }

  async getBundleBySlugClient(slug: string): Promise<SanityBundle | null> {
    return getBundleBySlugClient(slug);
  }

  /**
   * Create new custom bundle
   * Note: Custom bundle creation is simplified - products are added at their base price
   */
  createBundle(
    name: string,
    products: BundleProduct[],
    bundlePrice?: number
  ): Bundle {
    if (!name || name.trim().length === 0) {
      throw new Error('Bundle name is required');
    }

    if (products.length < 2) {
      throw new Error('Bundle must contain at least 2 products');
    }

    // Generate unique bundle ID
    const bundleId = `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Compute price if not explicitly set
    const computedPrice = bundlePrice ?? 0;

    const bundle: Bundle = {
      id: bundleId,
      name: name.trim(),
      products,
      bundlePrice,
      computedPrice,
    };

    return bundle;
  }

  /**
   * Add bundle to cart as single line item
   * Note: For custom bundles, price should be provided in the bundle object
   */
  async addBundleToCart(bundle: Bundle): Promise<Cart> {
    // Validate bundle has minimum products
    if (bundle.products.length < 2) {
      throw new Error('Bundle must contain at least 2 products');
    }

    // Use bundle price or computed price
    const finalPrice = bundle.bundlePrice ?? bundle.computedPrice;

    if (finalPrice <= 0) {
      throw new Error('Bundle price must be greater than 0');
    }

    // Get current cart
    const cart = cartService.getCart();

    // Generate item ID
    const itemId = `bundle-${bundle.id}`;

    // Create bundle line item
    const bundleItem: CartLineItem = {
      id: itemId,
      productId: bundle.id,
      productName: bundle.name,
      sizeKey: 'bundle',
      sizeName: 'Bundle',
      grams: 0,
      grind: 'Whole bean',
      quantity: 1,
      pricePerUnit: finalPrice,
      lineTotal: finalPrice,
      itemType: 'bundle' as const,
    };

    // Check if bundle already in cart
    const existingIndex = cart.lineItems.findIndex(
      (item) => item.id === itemId
    );

    let updatedLineItems;
    if (existingIndex >= 0) {
      // Increment quantity
      updatedLineItems = cart.lineItems.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + 1,
              lineTotal: (item.quantity + 1) * item.pricePerUnit,
            }
          : item
      );
    } else {
      updatedLineItems = [...cart.lineItems, bundleItem];
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

  /**
   * Remove unavailable products from bundle
   * Note: With the new model, all products are considered available
   */
  async removeUnavailableProducts(bundle: Bundle): Promise<Bundle> {
    // All products are considered available in the new model
    return bundle;
  }
}

export const bundleService = new BundleServiceImpl();
