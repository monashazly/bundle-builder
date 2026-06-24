'use client';

import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  size = 'md',
}: QuantityStepperProps) {
  const isAtMin = value <= min;

  const btnBase =
    'flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors';
  const btnSm = 'w-6 h-6 rounded-md';
  const btnMd = 'w-8 h-8 rounded-lg';

  const countSm = 'min-w-[32px] text-center text-sm font-medium text-gray-900';
  const countMd = 'min-w-[40px] text-center text-base font-medium text-gray-900';

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={isAtMin}
        aria-label="Decrease quantity"
        className={cn(
          btnBase,
          size === 'sm' ? btnSm : btnMd,
          isAtMin && 'opacity-40 cursor-not-allowed'
        )}
      >
        <span className="leading-none">−</span>
      </button>

      <span className={size === 'sm' ? countSm : countMd}>{value}</span>

      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={cn(btnBase, size === 'sm' ? btnSm : btnMd)}
      >
        <span className="leading-none">+</span>
      </button>
    </div>
  );
}
