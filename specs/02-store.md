# specs/02-store.md

## Goal

Build the Zustand store and selector hooks.
All qty state lives here. No component ever calls fetch() or uses useState for qty.

---

## Files

- `store/bundleStore.ts`
- `hooks/useBundleStore.ts`
- `store/bundleStore.test.ts`

---

## Store interface (exact — do not deviate)

```ts
interface BundleStore {
  // Server data
  categories: Category[];
  loading: boolean;
  error: string | null;

  // UI state
  activeStep: number; // 1–4, starts at 1

  // Quantities — all qty state lives here
  variantQty: Record<string, Record<string, number>>; // productId → variantId → qty
  singleQty: Record<string, number>; // productId → qty

  // Actions
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
```

---

## Action behaviour

### init()

1. Set loading: true, error: null
2. Call loadFromLocalStorage() — saved config takes precedence over seed
3. Call fetchInitialData() from lib/api.ts
4. Merge initialSingleQty + initialVariantQty into state
   (only for keys NOT already set by localStorage — don't overwrite user's saved config)
5. Set categories, loading: false
6. On error: set error message, loading: false

### setActiveStep(step)

Clamp to 1–4. Ignore values outside this range.

### incrementVariant(productId, variantId)

- Increment variantQty[productId][variantId] by 1
- If the nested record doesn't exist yet, create it
- After mutation: call saveToLocalStorage()

### decrementVariant(productId, variantId)

- Decrement by 1, minimum 0 (never go negative)
- After mutation: call saveToLocalStorage()

### setVariantQty(productId, variantId, qty)

- Set to Math.max(0, qty)
- After mutation: call saveToLocalStorage()

### incrementSingle / decrementSingle

- Same rules as variant versions
- decrementSingle: minimum 0
- After mutation: call saveToLocalStorage()

### saveToLocalStorage()

- Serialize { variantQty, singleQty } to localStorage key 'bundle-qty'
- Wrap in try/catch (localStorage can throw in some environments)

### loadFromLocalStorage()

- Read 'bundle-qty' from localStorage
- If found and valid JSON: merge into state (spread, don't replace)
- If missing or invalid: silently do nothing
- Wrap in try/catch

---

## Selector hooks (hooks/useBundleStore.ts)

These are NOT state — they are computed values derived from state.
They call the pure functions from lib/calculations.ts.

```ts
'use client';

export function useReviewItems(): ReviewLineItem[];
// → calls getReviewLineItems(categories, variantQty, singleQty)

export function useTotals(): BundleTotals;
// → calls computeTotals(reviewItems)

export function useSelectedCount(stepIndex: number): number;
// → calls getSelectedCountForStep(categories, stepIndex, variantQty, singleQty)

export function useActiveStepCategory(): Category | undefined;
// → returns categories.find(c => c.stepIndex === activeStep)
```

---

## Tests (store/bundleStore.test.ts)

1. decrementVariant at qty=0 stays at 0
2. decrementSingle at qty=0 stays at 0
3. setActiveStep(0) is ignored — step stays at 1
4. setActiveStep(5) is ignored — step stays at current (or max 4)
5. incrementVariant creates nested record if it doesn't exist
6. saveToLocalStorage + loadFromLocalStorage round-trip:
   set variantQty, save, reset state, load, assert qty restored
7. init() sets categories and loading: false on success
8. init() sets error on fetch failure

---

## Do NOT

- Add derived state to Zustand (use hooks/calculations instead)
- Use immer
- Add any UI state beyond activeStep (hover, modal open, etc. → components)
- Call fetch() directly in the store — use lib/api.ts
