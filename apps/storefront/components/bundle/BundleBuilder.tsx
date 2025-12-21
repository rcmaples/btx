'use client';

import { useState, useEffect } from 'react';
import type { Product, BundleProduct } from '@/lib/types';
import { BundleProductSelector } from './BundleProductSelector';
import { bundleService } from '@/lib/services/bundle/bundle-service';

interface BundleBuilderProps {
  products: Product[];
  onAddToCart?: () => void;
}

export function BundleBuilder({ products, onAddToCart }: BundleBuilderProps) {
  const [bundleName, setBundleName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<BundleProduct[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  // Calculate total price whenever selectedProducts changes
  useEffect(() => {
    const total = selectedProducts.reduce(
      (sum, item) => sum + item.priceInCents * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [selectedProducts]);

  const handleSelectProduct = (productId: string, priceInCents: number) => {
    // Check if product is already in bundle
    const existingIndex = selectedProducts.findIndex(
      (p) => p.productId === productId
    );

    if (existingIndex >= 0) {
      // Product already selected, don't add again
      return;
    }

    // Add new product to bundle
    setSelectedProducts([
      ...selectedProducts,
      { productId, priceInCents, quantity: 1 },
    ]);

    setError(null);
    setSuccess(false);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updated = selectedProducts.map((p) =>
      p.productId === productId ? { ...p, quantity } : p
    );
    setSelectedProducts(updated);
  };

  const handleRemove = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId)
    );
    setError(null);
    setSuccess(false);
  };

  const handleAddToCart = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!bundleName.trim()) {
      setError('Please enter a name for your bundle');
      return;
    }

    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products for your bundle');
      return;
    }

    setIsAdding(true);

    try {
      // Create bundle with computed price
      const bundle = bundleService.createBundle(
        bundleName,
        selectedProducts,
        totalPrice
      );

      // Add to cart
      await bundleService.addBundleToCart(bundle);

      // Success!
      setSuccess(true);
      setError(null);

      // Reset form
      setBundleName('');
      setSelectedProducts([]);

      // Notify parent
      if (onAddToCart) {
        onAddToCart();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add bundle to cart. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const getProductDetails = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    const selected = selectedProducts.find((p) => p.productId === productId);
    if (!product || !selected) return null;

    return {
      product,
      priceInCents: selected.priceInCents,
      quantity: selected.quantity,
    };
  };

  return (
    <div>
      <div className="mb-xl">
        <h2 className="text-3xl font-black mb-sm">Create Your Custom Bundle</h2>
        <p className="text-text-secondary">
          Select at least 2 products to create a custom coffee bundle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-xl">
        <div>
          <BundleProductSelector
            products={products}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        </div>

        <div>
          <div className="p-lg bg-background-secondary border-2 border-border sticky top-lg">
            <h3 className="text-xl font-bold mb-lg">Bundle Summary</h3>

            <div className="mb-lg">
              <label
                htmlFor="bundle-name"
                className="block text-sm font-medium mb-xs"
              >
                Bundle Name *
              </label>
              <input
                id="bundle-name"
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="e.g., Morning Blend Collection"
                className="w-full p-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
              />
            </div>

            <div className="mb-lg">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-sm">
                Selected Products ({selectedProducts.length})
              </h4>

              {selectedProducts.length === 0 ? (
                <p className="text-text-muted text-sm">
                  No products selected yet
                </p>
              ) : (
                <div className="space-y-sm">
                  {selectedProducts.map((selected) => {
                    const item = getProductDetails(selected.productId);
                    if (!item) return null;

                    return (
                      <div
                        key={selected.productId}
                        className="flex justify-between items-center p-sm bg-background border border-border"
                      >
                        <div>
                          <span className="font-medium block">
                            {item.product.name}
                          </span>
                          <span className="text-xs text-text-secondary">
                            Base size × {item.quantity}
                          </span>
                        </div>
                        <span className="font-mono font-bold">
                          $
                          {((item.priceInCents * item.quantity) / 100).toFixed(
                            2
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t-2 border-border pt-lg mb-lg">
              <div className="flex justify-between items-center mb-sm">
                <span className="text-lg font-bold">Bundle Total</span>
                <span className="text-2xl font-black font-mono">
                  ${(totalPrice / 100).toFixed(2)}
                </span>
              </div>

              {selectedProducts.length >= 2 && (
                <p className="text-sm text-text-muted">
                  All products at their regular prices — no additional bundle
                  discount
                </p>
              )}
            </div>

            {error && (
              <div
                className="p-md bg-danger-light border border-danger text-danger text-sm mb-lg"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="p-md bg-success-light border border-success text-success text-sm mb-lg"
                role="status"
              >
                Bundle added to cart successfully!
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={
                isAdding || selectedProducts.length < 2 || !bundleName.trim()
              }
              className="w-full py-md bg-primary text-background border-2 border-primary font-bold hover:bg-transparent hover:text-primary transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding to Cart...' : 'Add Bundle to Cart'}
            </button>

            <p className="text-xs text-text-muted text-center mt-sm">
              Minimum 2 products required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
