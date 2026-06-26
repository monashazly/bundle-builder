'use client';

import { QuantityStepper } from '@/components/QuantityStepper';
import { formatPrice } from '@/lib/calculations';
import type { ReviewLineItem as ReviewLineItemType } from '@/lib/types';
import { useBundleStore } from '@/store/bundleStore';
import Image from 'next/image';

interface ReviewLineItemProps {
  item: ReviewLineItemType;
  categoryId?: string;
}

export function ReviewLineItem({ item, categoryId }: ReviewLineItemProps) {
  const { product, variant, qty, linePrice, lineCompareAt } = item;
  const store = useBundleStore();
  const isPlan = categoryId === 'plan';

  const displayName = variant ? `${product.name} — ${variant.label}` : product.name;

  const increment = () =>
    variant ? store.incrementVariant(product.id, variant.id) : store.incrementSingle(product.id);

  const decrement = () =>
    variant ? store.decrementVariant(product.id, variant.id) : store.decrementSingle(product.id);

  const priceStr = isPlan ? `${formatPrice(linePrice)}/mo` : formatPrice(linePrice);
  const compareAtStr =
    lineCompareAt && lineCompareAt !== linePrice
      ? isPlan
        ? `${formatPrice(lineCompareAt)}/mo`
        : formatPrice(lineCompareAt)
      : null;

  return (
    <div className="flex items-center gap-[16px]">
      {/* Image + name + stepper grouped */}
      <div className="flex-[1_0_0] flex items-center gap-[12px] min-w-0">
        <div className="shrink-0 relative rounded-[5px] size-[41px] bg-white overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-contain" />
        </div>
        <p className="flex-[1_0_0] min-w-0 text-[14px] text-text-obsidian leading-[16px] tracking-[0.07px]">
          {displayName}
        </p>
        {!isPlan && (
          <QuantityStepper
            value={qty}
            onIncrement={increment}
            onDecrement={decrement}
            size="sm"
            variant="panel"
          />
        )}
      </div>

      {/* Prices — stacked: compare-at above, current below */}
      <div className="shrink-0 flex flex-col items-end">
        {compareAtStr && (
          <span className="text-[14px] text-[#6F7882] line-through leading-[16px]">
            {compareAtStr}
          </span>
        )}
        <span className="text-[14px] font-semibold text-prim-600 leading-[16px]">{priceStr}</span>
      </div>
    </div>
  );
}
