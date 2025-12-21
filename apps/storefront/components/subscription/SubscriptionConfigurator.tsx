'use client';

import { useState } from 'react';
import type { Product, PurchaseSelection, Subscription } from '@/lib/types';
import { CadenceSelector } from './CadenceSelector';
import { subscriptionService } from '@/lib/services/subscription/subscription-service';

interface SubscriptionConfiguratorProps {
  product: Product;
  selectedPurchaseOption: PurchaseSelection | null;
  onSuccess?: () => void;
}

export function SubscriptionConfigurator({
  product,
  selectedPurchaseOption,
  onSuccess,
}: SubscriptionConfiguratorProps) {
  const [cadence, setCadence] = useState<Subscription['cadence'] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddSubscriptionToCart = async () => {
    if (!selectedPurchaseOption) {
      setError('Please select size and grind first');
      return;
    }

    if (!cadence) {
      setError('Please select a delivery frequency');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsAdding(true);

    try {
      // Create subscription from purchase selection
      const subscription = subscriptionService.createSubscription(
        selectedPurchaseOption,
        cadence
      );

      // Add to cart
      await subscriptionService.addSubscriptionToCart(subscription);

      // Success!
      setSuccess(true);
      setCadence(null);

      // Notify parent
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add subscription to cart. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const recurringPrice = selectedPurchaseOption
    ? selectedPurchaseOption.priceInCents
    : 0;
  const formattedPrice = (recurringPrice / 100).toFixed(2);

  return (
    <div className="mt-xl pt-xl border-t-2 border-border">
      <div className="mb-lg">
        <h3 className="text-lg font-bold mb-xs">Subscribe & Save</h3>
        <p className="text-sm text-text-muted">
          Get {product.name} delivered on a recurring schedule
        </p>
      </div>

      <div>
        <CadenceSelector
          selectedCadence={cadence}
          onSelectCadence={setCadence}
          disabled={!selectedPurchaseOption || isAdding}
        />

        {selectedPurchaseOption && cadence && (
          <div className="p-md bg-background-alt border border-border-light mb-lg">
            <div className="flex justify-between mb-sm">
              <span className="text-sm text-text-muted">Product:</span>
              <span className="text-sm font-medium">
                {product.name} ({selectedPurchaseOption.sizeName} •{' '}
                {selectedPurchaseOption.grind})
              </span>
            </div>
            <div className="flex justify-between mb-sm">
              <span className="text-sm text-text-muted">Frequency:</span>
              <span className="text-sm font-medium">
                {cadence === 'bi-weekly'
                  ? 'Every 2 weeks'
                  : cadence === 'weekly'
                    ? 'Every week'
                    : 'Every month'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Recurring Price:</span>
              <span className="text-lg font-bold font-mono">${formattedPrice}</span>
            </div>
          </div>
        )}

        {!selectedPurchaseOption && (
          <p className="text-sm text-text-muted mb-lg">
            Please select a size and grind before configuring subscription
          </p>
        )}

        {error && (
          <div
            className="p-sm bg-danger-light text-danger border border-danger text-sm mb-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-sm bg-success-light text-success border border-success text-sm mb-lg"
            role="status"
          >
            Subscription added to cart successfully!
          </div>
        )}

        <button
          onClick={handleAddSubscriptionToCart}
          disabled={!selectedPurchaseOption || !cadence || isAdding}
          className="w-full py-md border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-background transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          {isAdding ? 'Adding...' : 'Add Subscription to Cart'}
        </button>

        <p className="text-xs text-text-muted mt-sm text-center">
          Note: Subscription management (pause, modify, cancel) is not available
          in this demo version
        </p>
      </div>
    </div>
  );
}
