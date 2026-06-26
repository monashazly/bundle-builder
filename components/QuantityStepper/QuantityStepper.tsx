'use client';

import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  size?: 'sm' | 'md';
  variant?: 'card' | 'panel';
}

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  size = 'md',
  variant = 'card',
}: QuantityStepperProps) {
  const isAtMin = value <= min;

  return (
    <div
      className={cn(
        'flex items-center py-[4px] rounded-[4px]',
        variant === 'panel' ? 'w-[72px] justify-between' : 'w-[80px] gap-[10px]'
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={isAtMin}
        aria-label="Decrease quantity"
        className={cn(
          'w-[20px] h-[20px] flex items-center justify-center rounded-[4px] cursor-pointer disabled:cursor-not-allowed flex-shrink-0',
          variant === 'panel' ? 'bg-white' : 'bg-white border-2 border-[#E6EBF0]'
        )}
      >
        <span
          className={cn(
            'text-[10px] leading-none select-none',
            isAtMin ? 'text-[#CED6DE]' : 'text-[#575757]'
          )}
        >
          −
        </span>
      </button>

      <span
        className={cn(
          'text-center text-[#0B0D10] leading-none tabular-nums select-none',
          size === 'sm'
            ? 'text-[14px] font-semibold min-w-[8px]'
            : 'text-[16px] font-medium min-w-[10px]'
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={cn(
          'w-[20px] h-[20px] flex items-center justify-center rounded-[4px] cursor-pointer flex-shrink-0',
          variant === 'panel' ? 'bg-white' : 'bg-[#F0F4F7]'
        )}
      >
        <span className="text-[10px] text-[#575757] leading-none select-none">+</span>
      </button>
    </div>
  );
}
