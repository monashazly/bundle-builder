'use client';

import { fetchCatalog, fetchConfig } from '@/lib/api';
import type { Category } from '@/lib/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

export const useBundleStore = create<BundleStore>()(
  devtools(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,
      activeStep: 1,
      variantQty: {},
      singleQty: {},

      init: async () => {
        // Prevent Strict Mode double-invoke and concurrent calls
        if (get().loading || get().categories.length > 0) return;
        set({ loading: true, error: null });

        try {
          // Read configId synchronously first so both fetches can fire in parallel
          const urlConfigId =
            new URLSearchParams(window.location.search).get('config') ?? undefined;
          const configId = urlConfigId ?? localStorage.getItem('bundle-config-id') ?? undefined;

          const [{ categories }, configItems] = await Promise.all([
            fetchCatalog(),
            configId
              ? fetchConfig(configId).catch(() => {
                  localStorage.removeItem('bundle-config-id');
                  return null;
                })
              : Promise.resolve(null),
          ]);

          if (configItems) {
            const variantQty: Record<string, Record<string, number>> = {};
            const singleQty: Record<string, number> = {};
            for (const item of configItems) {
              if (item.variantId) {
                variantQty[item.productId] ??= {};
                variantQty[item.productId][item.variantId] = item.qty;
              } else {
                singleQty[item.productId] = item.qty;
              }
            }
            set({ categories, variantQty, singleQty, loading: false });
          } else {
            set({ categories, singleQty: { ...DEFAULT_SINGLE_QTY }, loading: false });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load products';
          set({ error: message, loading: false });
        }
      },

      setActiveStep: (step) => {
        if (step < 0 || step > get().categories.length) return;
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
    }),
    { name: 'BundleStore' }
  )
);
