'use client';

import { cn } from '@/lib/cn';
import type { Variant } from '@/lib/types';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isSelected = variant.id === selectedVariantId;
        const isWhite = variant.color.toUpperCase() === '#FFFFFF';

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm cursor-pointer transition-colors',
              isSelected
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
            )}
          >
            <span
              className={cn(
                'w-3.5 h-3.5 rounded-full border flex-shrink-0',
                isWhite ? 'border-gray-300' : 'border-gray-200'
              )}
              style={{ backgroundColor: variant.color }}
            />
            {variant.label}
          </button>
        );
      })}
    </div>
  );
}
