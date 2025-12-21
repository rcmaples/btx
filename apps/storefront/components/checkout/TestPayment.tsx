'use client';

import { useState } from 'react';

interface TestPaymentProps {
  total: number;
  onComplete: () => void;
  isProcessing: boolean;
}

export function TestPayment({
  total,
  onComplete,
  isProcessing,
}: TestPaymentProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const formattedTotal = (total / 100).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="space-y-lg">
      <div className="p-md bg-warning-light border-2 border-warning">
        <h3 className="text-lg font-bold mb-sm">TEST MODE PAYMENT</h3>
        <p className="text-sm text-text-secondary">
          This is a test payment interface. No real payment will be processed.
          Use any card details - they will not be validated or stored.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-lg">
        <h2 className="text-2xl font-bold">Payment Information</h2>

        <div className="flex justify-between items-center p-md bg-background-secondary border border-border">
          <span className="text-lg font-medium">Total to Pay:</span>
          <span className="text-2xl font-bold font-mono">${formattedTotal}</span>
        </div>

        <div className="space-y-md">
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium mb-xs"
          >
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full p-sm border border-border bg-background text-text font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            disabled={isProcessing}
          />
          <p className="text-xs text-text-muted">Any card number (test only)</p>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium mb-xs"
            >
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-sm border border-border bg-background text-text font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
              placeholder="MM/YY"
              maxLength={5}
              disabled={isProcessing}
            />
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium mb-xs">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="w-full p-sm border border-border bg-background text-text font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed"
              placeholder="123"
              maxLength={4}
              disabled={isProcessing}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-md px-lg bg-primary text-background border-2 border-primary text-base font-semibold cursor-pointer transition-all duration-fast hover:bg-primary-dark hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 disabled:bg-disabled disabled:border-disabled disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? 'Processing Order...' : `Pay $${formattedTotal} (Test)`}
        </button>

        <p className="text-xs text-text-muted text-center">
          By completing this test checkout, you acknowledge that this is a
          demonstration and no actual payment will be processed.
        </p>
      </form>
    </div>
  );
}
