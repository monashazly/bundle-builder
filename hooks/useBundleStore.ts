'use client';

import { computeTotals, getReviewLineItems, getSelectedCountForStep } from '@/lib/calculations';
import type { BundleTotals, Category, ReviewLineItem } from '@/lib/types';
import { useBundleStore as useStore } from '@/store/bundleStore';
import { useMemo } from 'react';

export function useReviewItems(): ReviewLineItem[] {
  const categories = useStore((s) => s.categories);
  const variantQty = useStore((s) => s.variantQty);
  const singleQty = useStore((s) => s.singleQty);
  return useMemo(
    () => getReviewLineItems(categories, variantQty, singleQty),
    [categories, variantQty, singleQty]
  );
}

export function useTotals(): BundleTotals {
  const items = useReviewItems();
  return useMemo(() => computeTotals(items), [items]);
}

export function useSelectedCount(stepIndex: number): number {
  return useStore((s) =>
    getSelectedCountForStep(s.categories, stepIndex, s.variantQty, s.singleQty)
  );
}

export function useActiveStepCategory(): Category | undefined {
  return useStore((s) => s.categories.find((c) => c.stepIndex === s.activeStep));
}
