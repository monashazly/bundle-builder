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
        'relative flex flex-row gap-3 p-4 bg-white rounded-2xl shadow-sm transition-colors cursor-default',
        isSelected ? 'border-2 border-blue-600' : 'border border-gray-200'
      )}
    >
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 bg-indigo-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {product.badge}
        </span>
      )}

      {/* Left: product image */}
      <div className="flex-shrink-0 w-20 flex items-center justify-center pt-5">
        <Image
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="w-16 h-16 object-contain"
        />
      </div>

      {/* Right: content */}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm mt-1">{product.name}</p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{product.description}</p>

        {product.learnMoreUrl && (
          <a
            href={product.learnMoreUrl}
            className="text-xs text-blue-600 mt-1 hover:underline w-fit"
          >
            Learn more
          </a>
        )}

        {hasVariants && (
          <div className="mt-2">
            <VariantSelector
              variants={product.variants!}
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <QuantityStepper value={qty} onIncrement={increment} onDecrement={decrement} size="md" />

          <div className="flex items-center gap-1.5">
            {product.compareAtPrice && (
              <span className="text-xs text-orange-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-sm font-semibold text-blue-700">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
