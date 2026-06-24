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
        'relative flex flex-col p-4 bg-white rounded-2xl shadow-sm transition-colors cursor-default',
        isSelected ? 'border-2 border-blue-600' : 'border border-gray-200'
      )}
    >
      {product.badge && (
        <span className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
          {product.badge}
        </span>
      )}

      <div className="h-20 flex items-center justify-center my-4">
        <Image
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="h-20 w-auto object-contain"
        />
      </div>

      <p className="font-medium text-gray-900">{product.name}</p>
      <p className="text-sm text-gray-500 mt-1">{product.description}</p>

      {product.learnMoreUrl && (
        <a href={product.learnMoreUrl} className="text-sm text-blue-600 mt-1 hover:underline w-fit">
          Learn more →
        </a>
      )}

      {hasVariants && (
        <div className="mt-3">
          <VariantSelector
            variants={product.variants!}
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <QuantityStepper value={qty} onIncrement={increment} onDecrement={decrement} size="md" />

        <div className="flex items-center gap-2">
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
