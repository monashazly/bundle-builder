'use client';

import { QuantityStepper } from '@/components/QuantityStepper';
import { VariantSelector } from '@/components/VariantSelector';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/calculations';
import type { Product } from '@/lib/types';
import { useBundleStore } from '@/store/bundleStore';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasVariants = !!product.variants?.length;
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id ?? '');
  const store = useBundleStore();

  const qty = useBundleStore((s) =>
    hasVariants
      ? (s.variantQty[product.id]?.[selectedVariantId] ?? 0)
      : (s.singleQty[product.id] ?? 0)
  );

  const isSelected = useBundleStore((s) => {
    if (hasVariants) {
      return product.variants!.some((v) => (s.variantQty[product.id]?.[v.id] ?? 0) > 0);
    }
    return (s.singleQty[product.id] ?? 0) > 0;
  });

  const increment = () =>
    hasVariants
      ? store.incrementVariant(product.id, selectedVariantId)
      : store.incrementSingle(product.id);

  const decrement = () =>
    hasVariants
      ? store.decrementVariant(product.id, selectedVariantId)
      : store.decrementSingle(product.id);

  return (
    <div
      className={cn(
        'relative flex flex-row bg-white rounded-[10px] transition-colors overflow-hidden p-[11px] gap-[19px]',
        isSelected ? 'border-2 border-[rgba(78,47,210,0.7)]' : 'border border-border-default'
      )}
    >
      {/* Image — fixed 101×137px to match Figma */}
      <div className="relative shrink-0 w-[101px] h-[137px] rounded-[5px] overflow-hidden bg-white">
        <Image src={product.image} alt={product.name} fill className="object-contain" />
        {product.badge && (
          <span className="absolute top-0 left-0 z-10 bg-prim-600 text-white text-[12px] font-semibold px-[6px] py-[2px] rounded-[10px] leading-[normal]">
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 gap-[10px]">
        <div className="flex flex-col gap-[8px] tracking-[0.6px]">
          <p className="text-[16px] font-semibold text-[#1F1F1F] leading-none">{product.name}</p>
          <p className="text-[12px] text-[rgba(31,31,31,0.75)] leading-[1.3] tracking-[0.6px]">
            {product.description}
          </p>
          {product.learnMoreUrl && (
            <a
              href={product.learnMoreUrl}
              className="text-[12px] text-[#0000ee] underline leading-none"
            >
              Learn More
            </a>
          )}
        </div>

        {hasVariants && (
          <VariantSelector
            variants={product.variants!}
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariantId}
            productImage={product.image}
          />
        )}

        {/* Stepper + price */}
        <div className="flex items-end gap-[10px] mt-auto">
          <QuantityStepper value={qty} onIncrement={increment} onDecrement={decrement} size="md" />
          <div className="flex flex-col items-end gap-[3px] ml-auto tracking-[0.6px]">
            {product.compareAtPrice && (
              <span className="text-[16px] text-price-card-compare line-through leading-none">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-[16px] text-price-card-current leading-none">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
