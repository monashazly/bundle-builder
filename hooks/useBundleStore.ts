'use client';

import { computeTotals, getReviewLineItems, getSelectedCountForStep } from '@/lib/calculations';
import type { BundleTotals, Category, ReviewLineItem } from '@/lib/types';
import { useBundleStore as useStore } from '@/store/bundleStore';

export function useReviewItems(): ReviewLineItem[] {
  return useStore((s) => getReviewLineItems(s.categories, s.variantQty, s.singleQty));
}

export function useTotals(): BundleTotals {
  const items = useReviewItems();
  return computeTotals(items);
}

export function useSelectedCount(stepIndex: number): number {
  return useStore((s) =>
    getSelectedCountForStep(s.categories, stepIndex, s.variantQty, s.singleQty)
  );
}

export function useActiveStepCategory(): Category | undefined {
  return useStore((s) => s.categories.find((c) => c.stepIndex === s.activeStep));
}
