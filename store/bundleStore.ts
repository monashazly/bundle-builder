'use client';

import { fetchInitialData } from '@/lib/api';
import type { Category } from '@/lib/types';
import { create } from 'zustand';

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
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

export const useBundleStore = create<BundleStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  activeStep: 1,
  variantQty: {},
  singleQty: {},

  init: async () => {
    set({ loading: true, error: null });
    get().loadFromLocalStorage();

    try {
      const { categories, initialSingleQty, initialVariantQty } = await fetchInitialData();

      const currentSingle = get().singleQty;
      const currentVariant = get().variantQty;

      const mergedSingle = { ...initialSingleQty, ...currentSingle };

      const mergedVariant = { ...initialVariantQty };
      for (const productId of Object.keys(currentVariant)) {
        mergedVariant[productId] = {
          ...(initialVariantQty[productId] ?? {}),
          ...currentVariant[productId],
        };
      }

      set({ categories, singleQty: mergedSingle, variantQty: mergedVariant, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      set({ error: message, loading: false });
    }
  },

  setActiveStep: (step) => {
    if (step < 1 || step > 4) return;
    set({ activeStep: step });
  },

  incrementVariant: (productId, variantId) => {
    const { variantQty } = get();
    const current = variantQty[productId]?.[variantId] ?? 0;
    set({
      variantQty: {
        ...variantQty,
        [productId]: { ...(variantQty[productId] ?? {}), [variantId]: current + 1 },
      },
    });
    get().saveToLocalStorage();
  },

  decrementVariant: (productId, variantId) => {
    const { variantQty } = get();
    const current = variantQty[productId]?.[variantId] ?? 0;
    set({
      variantQty: {
        ...variantQty,
        [productId]: { ...(variantQty[productId] ?? {}), [variantId]: Math.max(0, current - 1) },
      },
    });
    get().saveToLocalStorage();
  },

  setVariantQty: (productId, variantId, qty) => {
    const { variantQty } = get();
    set({
      variantQty: {
        ...variantQty,
        [productId]: { ...(variantQty[productId] ?? {}), [variantId]: Math.max(0, qty) },
      },
    });
    get().saveToLocalStorage();
  },

  incrementSingle: (productId) => {
    const { singleQty } = get();
    set({ singleQty: { ...singleQty, [productId]: (singleQty[productId] ?? 0) + 1 } });
    get().saveToLocalStorage();
  },

  decrementSingle: (productId) => {
    const { singleQty } = get();
    set({
      singleQty: { ...singleQty, [productId]: Math.max(0, (singleQty[productId] ?? 0) - 1) },
    });
    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    try {
      const { variantQty, singleQty } = get();
      localStorage.setItem('bundle-qty', JSON.stringify({ variantQty, singleQty }));
    } catch {
      // localStorage unavailable in some environments
    }
  },

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem('bundle-qty');
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        variantQty: Record<string, Record<string, number>>;
        singleQty: Record<string, number>;
      };
      set((state) => ({
        variantQty: { ...state.variantQty, ...parsed.variantQty },
        singleQty: { ...state.singleQty, ...parsed.singleQty },
      }));
    } catch {
      // malformed JSON or localStorage unavailable
    }
  },
}));
