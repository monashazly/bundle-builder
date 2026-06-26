'use client';

import { fetchCatalog, fetchConfig } from '@/lib/api';
import type { Category } from '@/lib/types';
import { create } from 'zustand';

const DEFAULT_SINGLE_QTY: Record<string, number> = {
  'plan-standard': 1,
  'sensor-door': 2,
  'extra-keypad': 1,
};

interface BundleStore {
  categories: Category[];
  loading: boolean;
  error: string | null;

  activeStep: number;

  variantQty: Record<string, Record<string, number>>;
  singleQty: Record<string, number>;

  init: () => Promise<void>;
  setActiveStep: (step: number) => void;
  incrementVariant: (productId: string, variantId: string) => void;
  decrementVariant: (productId: string, variantId: string) => void;
  setVariantQty: (productId: string, variantId: string, qty: number) => void;
  incrementSingle: (productId: string) => void;
  decrementSingle: (productId: string) => void;
}

export const useBundleStore = create<BundleStore>((set) => ({
  categories: [],
  loading: false,
  error: null,
  activeStep: 1,
  variantQty: {},
  singleQty: {},

  init: async () => {
    set({ loading: true, error: null });

    try {
      const { categories } = await fetchCatalog();

      const urlConfigId = new URLSearchParams(window.location.search).get('config') ?? undefined;
      const configId = urlConfigId ?? localStorage.getItem('bundle-config-id') ?? undefined;

      if (configId) {
        try {
          const items = await fetchConfig(configId);
          const variantQty: Record<string, Record<string, number>> = {};
          const singleQty: Record<string, number> = {};
          for (const item of items) {
            if (item.variantId) {
              variantQty[item.productId] ??= {};
              variantQty[item.productId][item.variantId] = item.qty;
            } else {
              singleQty[item.productId] = item.qty;
            }
          }
          set({ categories, variantQty, singleQty, loading: false });
        } catch {
          localStorage.removeItem('bundle-config-id');
          const defaults = { ...DEFAULT_SINGLE_QTY };
          localStorage.setItem('bundle-default-qty', JSON.stringify(defaults));
          set({ categories, singleQty: defaults, loading: false });
        }
      } else {
        const defaults = { ...DEFAULT_SINGLE_QTY };
        localStorage.setItem('bundle-default-qty', JSON.stringify(defaults));
        set({ categories, singleQty: defaults, loading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      set({ error: message, loading: false });
    }
  },

  setActiveStep: (step) => {
    if (step < 0 || step > 4) return;
    set({ activeStep: step });
  },

  incrementVariant: (productId, variantId) =>
    set((state) => {
      const current = state.variantQty[productId]?.[variantId] ?? 0;
      return {
        variantQty: {
          ...state.variantQty,
          [productId]: { ...(state.variantQty[productId] ?? {}), [variantId]: current + 1 },
        },
      };
    }),

  decrementVariant: (productId, variantId) =>
    set((state) => {
      const current = state.variantQty[productId]?.[variantId] ?? 0;
      return {
        variantQty: {
          ...state.variantQty,
          [productId]: {
            ...(state.variantQty[productId] ?? {}),
            [variantId]: Math.max(0, current - 1),
          },
        },
      };
    }),

  setVariantQty: (productId, variantId, qty) =>
    set((state) => ({
      variantQty: {
        ...state.variantQty,
        [productId]: { ...(state.variantQty[productId] ?? {}), [variantId]: Math.max(0, qty) },
      },
    })),

  incrementSingle: (productId) =>
    set((state) => ({
      singleQty: { ...state.singleQty, [productId]: (state.singleQty[productId] ?? 0) + 1 },
    })),

  decrementSingle: (productId) =>
    set((state) => ({
      singleQty: {
        ...state.singleQty,
        [productId]: Math.max(0, (state.singleQty[productId] ?? 0) - 1),
      },
    })),
}));
