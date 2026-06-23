# specs/03-steppers.md

## Goal

Build QuantityStepper and VariantSelector — the two smallest shared components.
Build and test these before ProductCard, which depends on them.

---

## QuantityStepper

### Files

- `components/QuantityStepper/QuantityStepper.tsx`
- `components/QuantityStepper/index.ts`
- `components/QuantityStepper/QuantityStepper.test.tsx`

### Props

```ts
interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number; // default 0
  size?: 'sm' | 'md'; // 'md' on cards, 'sm' in review panel
}
```

### Visual

```
[−]  [2]  [+]
```

Size `md` (product cards):

- Buttons: 32×32px, rounded-lg, border border-gray-200, bg-white, hover:bg-gray-50
- Count: min-w-[40px], text-center, text-base, font-medium, text-gray-900

Size `sm` (review panel):

- Buttons: 24×24px, rounded-md, border border-gray-200, bg-white, hover:bg-gray-50
- Count: min-w-[32px], text-center, text-sm, font-medium, text-gray-900

Minus button disabled state (value === min):

- `disabled` attribute set
- `opacity-40 cursor-not-allowed` classes
- onClick does NOT fire

Plus button: never disabled.

Wrapper: `flex items-center gap-1`

### Tests

1. Renders correct value
2. onIncrement fires on + click
3. onDecrement fires on − click when value > 0
4. onDecrement does NOT fire on − click when value === 0
5. Minus button has disabled attribute when value === 0
6. Size sm renders smaller buttons (check className contains 'w-6')

---

## VariantSelector

### Files

- `components/VariantSelector/VariantSelector.tsx`
- `components/VariantSelector/index.ts`

### Props

```ts
interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
}
```

### Visual

Row of pill chips, `flex flex-wrap gap-2`:

Each chip: `flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm
            cursor-pointer transition-colors`

Unselected: `border-gray-200 bg-white text-gray-700 hover:border-gray-400`
Selected: `border-blue-600 bg-blue-50 text-blue-700`

Color swatch inside chip: `w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0`
(inline style for background color — `style={{ backgroundColor: variant.color }}`)

White swatch gets `border-gray-300` so it's visible against white bg.

### Behaviour

- Clicking a chip calls onSelect(variant.id)
- The selected chip is highlighted (controlled component — parent owns selectedVariantId)

### No tests needed for VariantSelector

(covered by ProductCard tests)

---

## Do NOT

- Add animation to VariantSelector chips
- Disable any variant chip
- Store selectedVariantId in Zustand — it's local UI state in ProductCard
