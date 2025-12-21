'use client';

import type { Subscription } from '@/lib/types';

interface CadenceSelectorProps {
  selectedCadence: Subscription['cadence'] | null;
  onSelectCadence: (cadence: Subscription['cadence']) => void;
  disabled?: boolean;
}

const CADENCE_OPTIONS: Array<{
  value: Subscription['cadence'];
  label: string;
  description: string;
}> = [
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Delivered every week',
  },
  {
    value: 'bi-weekly',
    label: 'Bi-Weekly',
    description: 'Delivered every 2 weeks',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Delivered every month',
  },
];

export function CadenceSelector({
  selectedCadence,
  onSelectCadence,
  disabled = false,
}: CadenceSelectorProps) {
  return (
    <div className="mb-lg">
      <label className="block text-sm font-bold uppercase tracking-wider mb-sm">
        Delivery Frequency *
      </label>

      <div className="space-y-sm">
        {CADENCE_OPTIONS.map((option) => {
          const isSelected = selectedCadence === option.value;
          const id = `cadence-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`block p-md border-2 cursor-pointer transition-all duration-fast ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                id={id}
                name="cadence"
                value={option.value}
                checked={isSelected}
                onChange={() => onSelectCadence(option.value)}
                disabled={disabled}
                className="sr-only"
              />
              <div>
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-text-muted">
                  {option.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
