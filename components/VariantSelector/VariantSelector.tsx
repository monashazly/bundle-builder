'use client';

import { cn } from '@/lib/cn';
import type { Variant } from '@/lib/types';
import Image from 'next/image';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
  productImage?: string;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  productImage,
}: VariantSelectorProps) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {variants.map((variant) => {
        const isSelected = variant.id === selectedVariantId;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant.id)}
            className={cn(
              'flex items-center justify-center gap-[4px] w-[65px] h-[26px] px-[3px] py-[1px] rounded-[2px] cursor-pointer transition-colors',
              isSelected
                ? 'border-[0.5px] border-[#0AA288] bg-[rgba(29,240,187,0.04)]'
                : 'border-[0.5px] border-[#CCCCCC] bg-white'
            )}
          >
            {productImage && (
              <Image
                src={productImage}
                alt={variant.label}
                width={22}
                height={22}
                className="w-[22px] h-[22px] rounded-[5px] object-contain flex-shrink-0"
              />
            )}
            <span className="text-[10px] text-[#1F1F1F] tracking-[0.6px] leading-none whitespace-nowrap">
              {variant.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
