# specs/06-review-panel.md

## Goal

Build the "Your security system" review panel — right column.
Live summary. Every qty change anywhere reflects here instantly.

---

## Files

- `components/ReviewPanel/ReviewPanel.tsx`
- `components/ReviewPanel/ReviewLineItem.tsx`
- `components/ReviewPanel/index.ts`
- `components/ReviewPanel/ReviewPanel.test.tsx`

---

## Visual anatomy

```
┌──────────────────────────────────┐
│ Your security system             │  text-xl font-semibold text-gray-900
│                                  │
│  CAMERAS                         │  text-xs uppercase tracking-widest
│  ┌─────────────────────────────┐ │  text-gray-400 mb-2 mt-4
│  │[img] Outdoor Camera Pro     │ │
│  │      White                  │ │  text-sm font-medium text-gray-900
│  │      [−][2][+]   $310 ~~$398││  sm stepper + price right-aligned
│  └─────────────────────────────┘ │
│                                  │
│  SENSORS                         │
│  [img] Door & Window Sensor      │
│        [−][2][+]   $46  ~~$58~~ │
│                                  │
│  ACCESSORIES                     │
│  [img] Keypad                    │
│        [−][1][+]   $62  ~~$69~~ │
│                                  │
│  PLAN                            │
│  [img] Standard Plan             │
│        [−][1][+]   $14.99        │
│                                  │
│  ─────────────────────────────   │  divider
│  🚚 Free shipping                │  text-sm text-gray-500
│  ✓  60-day money-back guarantee  │  text-sm text-gray-500
│  ◎  Finance from $X/mo           │  text-sm text-gray-500
│  ─────────────────────────────   │
│                                  │
│  Total    $432.98  ~~$526.97~~   │  font-semibold text-gray-900
│  You save $93.99                 │  text-sm text-green-600 font-medium
│                                  │
│  [        Checkout        ]      │  blue-600 w-full py-3 rounded-xl
│  Save my system for later        │  text-sm text-blue-600 underline center
└──────────────────────────────────┘
```

---

## ReviewLineItem component

```ts
interface ReviewLineItemProps {
  item: ReviewLineItem; // from lib/types.ts
}
```

Layout: `flex items-start gap-3 py-3 border-b border-gray-100 last:border-0`

Left: product image

- `w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0`

Middle (`flex-1 min-w-0`):

- Name + variant: `text-sm font-medium text-gray-900`
  Format: `"Outdoor Camera Pro — White"` (dash separator if variant exists)
- QuantityStepper size="sm" below name, `mt-1.5`

Right (`text-right flex-shrink-0`):

- Line total: `text-sm font-medium text-gray-900`
- Compare-at: `text-xs text-gray-400 line-through` (below total, if applicable)

The stepper here calls the SAME store actions as the card stepper:

- Variant product: `incrementVariant(product.id, variant.id)`
- Single product: `incrementSingle(product.id)`
  This is what makes them stay in sync automatically.

---

## Category grouping

```ts
const items = useReviewItems(); // from hooks/useBundleStore.ts
```

Group by category. Use `categories` from the store to get display labels
and preserve the correct order: Cameras → Plan → Sensors → Extras.

Only render a category subheading if that category has ≥1 item with qty > 0.

```ts
const groupedItems = categories
  .map((cat) => ({
    label: cat.label,
    items: items.filter((item) => item.product.id starts with cat.id prefix
      // better: look up product in cat.products by id
    ),
  }))
  .filter((group) => group.items.length > 0);
```

Correct approach: for each ReviewLineItem, find which category its product belongs to
by checking `categories.find(cat => cat.products.some(p => p.id === item.product.id))`.

---

## Footer section

Shipping / guarantee / financing rows:

```tsx
<div className="flex items-center gap-2 text-sm text-gray-500">
  <Truck size={16} />
  <span>Free shipping</span>
</div>
// repeat for CheckCircle (guarantee) and CreditCard (financing)
```

Financing line: compute `formatPrice(totals.total / 12)` + "/mo" — rough estimate only.

Dividers: `<hr className="border-gray-100 my-4" />`

---

## Total section

```tsx
<div className="flex items-center justify-between">
  <span className="font-semibold text-gray-900">Total</span>
  <div className="text-right">
    <span className="font-semibold text-gray-900">{formatPrice(totals.total)}</span>
    {totals.savings > 0 && (
      <span className="text-sm text-gray-400 line-through block">
        {formatPrice(totals.subtotal)}
      </span>
    )}
  </div>
</div>;
{
  totals.savings > 0 && (
    <p className="text-sm text-green-600 font-medium mt-1">
      You save {formatPrice(totals.savings)}
    </p>
  );
}
```

---

## Empty state

When `items.length === 0`:

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <ShoppingCart size={32} className="text-gray-300 mb-3" />
  <p className="text-sm text-gray-400">
    Your system is empty. Add products from the steps on the left.
  </p>
</div>
```

---

## Save my system for later

```tsx
const [saved, setSaved] = useState(false);

const handleSave = async () => {
  store.saveToLocalStorage();
  const items = buildConfigItems(variantQty, singleQty); // flatten to ConfigItem[]
  await saveConfig(items); // from lib/api.ts — fires POST /api/configs
  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
};
```

Link text: `saved ? "Saved! Come back anytime." : "Save my system for later"`

---

## Checkout button

```tsx
<button onClick={() => alert('Checkout coming soon!')}>Checkout</button>
```

---

## Tests

1. Empty state renders when no items in store
2. After incrementSingle('plan-standard'), "PLAN" heading and plan item appear
3. After incrementVariant('cam-outdoor-pro', 'cam-outdoor-pro-white', 2):
   - Item appears under "CAMERAS"
   - Line total shows $310 (155 × 2)
   - Compare-at shows $398 (199 × 2)
4. Stepper in panel increments qty — card stepper also reflects the change
5. Total updates when qty changes
6. "Save my system for later" calls saveToLocalStorage

---

## Do NOT

- Compute totals inside the component — use useTotals() hook
- Re-implement grouping logic — use categories from store to determine order
- Implement real checkout
