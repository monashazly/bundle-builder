// lib/calculations.ts
// Pure functions — no store, no Next.js, no browser APIs.
// Fully testable in isolation with Vitest.

import type { Category, ReviewLineItem, BundleTotals } from './types';

export function getReviewLineItems(
  categories: Category[],
  variantQty: Record<string, Record<string, number>>,
  singleQty: Record<string, number>
): ReviewLineItem[] {
  const items: ReviewLineItem[] = [];

  for (const category of categories) {
    for (const product of category.products) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const qty = variantQty[product.id]?.[variant.id] ?? 0;
          if (qty > 0) {
            items.push({
              product,
              variant,
              qty,
              linePrice: product.price * qty,
              lineCompareAt: product.compareAtPrice ? product.compareAtPrice * qty : undefined,
            });
          }
        }
      } else {
        const qty = singleQty[product.id] ?? 0;
        if (qty > 0) {
          items.push({
            product,
            qty,
            linePrice: product.price * qty,
            lineCompareAt: product.compareAtPrice ? product.compareAtPrice * qty : undefined,
          });
        }
      }
    }
  }

  return items;
}

export function computeTotals(items: ReviewLineItem[]): BundleTotals {
  const total = items.reduce((sum, item) => sum + item.linePrice, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.lineCompareAt ?? item.linePrice), 0);
  return { subtotal, total, savings: subtotal - total };
}

export function getSelectedCountForStep(
  categories: Category[],
  stepIndex: number,
  variantQty: Record<string, Record<string, number>>,
  singleQty: Record<string, number>
): number {
  const category = categories.find((c) => c.stepIndex === stepIndex);
  if (!category) return 0;

  return category.products.filter((product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.some((v) => (variantQty[product.id]?.[v.id] ?? 0) > 0);
    }
    return (singleQty[product.id] ?? 0) > 0;
  }).length;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}
