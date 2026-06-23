# specs/04-product-card.md

## Goal

Build the ProductCard component. This is the most complex component —
it must handle variant-aware qty binding correctly.

---

## Files

- `components/ProductCard/ProductCard.tsx`
- `components/ProductCard/index.ts`
- `components/ProductCard/ProductCard.test.tsx`

---

## Props

```ts
interface ProductCardProps {
  product: Product;
}
// Reads qty directly from Zustand — no qty props passed in
```

---

## Visual anatomy (top to bottom)

```
┌────────────────────────────────────┐
│ [Save 22%]  ← badge, top-left     │  absolute, optional
│                                    │
│        [product image]             │  h-20 object-contain mx-auto my-4
│                                    │
│  Product name          font-medium │  text-gray-900
│  Short description     text-sm     │  text-gray-500 mt-1
│  Learn more →          text-sm     │  text-blue-600 mt-1, optional
│                                    │
│  [White ●] [Black ●]               │  VariantSelector, optional, mt-3
│                                    │
│  [−][0][+]        $155  ~~$199~~   │  stepper left, price right, mt-4
└────────────────────────────────────┘
```

Card wrapper classes:

```
relative flex flex-col p-4 bg-white rounded-2xl shadow-sm
transition-colors cursor-default
```

Unselected: `border border-gray-200`
Selected (any qty > 0): `border-2 border-blue-600`

Badge (when product.badge exists):

```
absolute top-3 left-3
bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full
```

---

## Variant-aware qty binding (critical — read carefully)

ProductCard holds `selectedVariantId` in LOCAL useState:

```ts
const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id ?? '');
```

This is the ONLY useState allowed in this component. It is pure UI state
(which chip is visually active) — not quantity state.

For a product WITH variants:

```ts
const qty = useBundleStore((s) => s.variantQty[product.id]?.[selectedVariantId] ?? 0);
const increment = () => store.incrementVariant(product.id, selectedVariantId);
const decrement = () => store.decrementVariant(product.id, selectedVariantId);
```

For a product WITHOUT variants:

```ts
const qty = useBundleStore((s) => s.singleQty[product.id] ?? 0);
const increment = () => store.incrementSingle(product.id);
const decrement = () => store.decrementSingle(product.id);
```

Selected state (blue border) — product has ANY qty > 0 across ALL variants:

```ts
const isSelected = useBundleStore((s) => {
  if (product.variants?.length) {
    return product.variants.some((v) => (s.variantQty[product.id]?.[v.id] ?? 0) > 0);
  }
  return (s.singleQty[product.id] ?? 0) > 0;
});
```

---

## Pricing display

- compareAtPrice exists: `<span line-through gray-400>$199</span> <span gray-900 font-medium>$155</span>`
- No compareAtPrice: just `<span gray-900 font-medium>$149</span>`
- Use formatPrice() from lib/calculations.ts

Price row: `flex items-center justify-between mt-4`
Left: QuantityStepper size="md"
Right: price(s) `flex items-center gap-2`

---

## Tests (ProductCard.test.tsx)

Mock the Zustand store using `vi.mock` or set up a real store instance.

1. Badge renders when product.badge is set
2. Badge absent when product.badge is undefined
3. VariantSelector renders for products with variants
4. VariantSelector absent for products without variants
5. Learn More link renders when learnMoreUrl is set, absent otherwise
6. Stepper shows qty=0 initially for a fresh product
7. Switching variant updates stepper value to THAT variant's qty
   (add 2 to White, switch to Black → stepper shows 0)
8. Adding qty gives card the blue border (border-2 border-blue-600)
9. Card has gray border when all qty === 0

---

## Do NOT

- Store selectedVariantId in Zustand
- Show VariantSelector when variants array is empty or undefined
- Show Learn More when learnMoreUrl is undefined
- Use compareAtPrice in the stepper logic (it's display only)
