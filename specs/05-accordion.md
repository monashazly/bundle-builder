# specs/05-accordion.md

## Goal

Build the 4-step accordion that wraps the builder (left column).

---

## Files

- `components/Accordion/Accordion.tsx`
- `components/Accordion/AccordionStep.tsx`
- `components/Accordion/index.ts`
- `components/Accordion/Accordion.test.tsx`

---

## Visual spec

### Step header (always visible)

```
┌──────────────────────────────────────────────────────┐
│  STEP 1 OF 4   [icon]  Choose your cameras   [2] ∧  │
│                                               or  ∨  │
└──────────────────────────────────────────────────────┘
```

Left cluster (`flex items-center gap-3`):

- "STEP N OF 4": `text-xs font-medium uppercase tracking-widest text-gray-400`
- Icon: use lucide-react. Camera → `<Camera>`, Plan → `<Shield>`,
  Sensors → `<Wifi>`, Extras → `<Plus>`. Size 20, `text-gray-500`
- Step title: `text-base font-medium text-gray-900`

Right cluster (`flex items-center gap-2 ml-auto`):

- When OPEN: `"{N} selected"` pill: `text-sm bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full` + `<ChevronUp size={18} className="text-gray-400" />`
- When CLOSED: `<ChevronDown size={18} className="text-gray-400" />` only

Header: `flex items-center gap-3 px-5 py-4 cursor-pointer select-none`
Header hover: `hover:bg-gray-50`

### Step card

```
bg-white rounded-2xl border shadow-sm overflow-hidden
```

Active step border: `border-blue-200`
Inactive step border: `border-gray-200`

### Step body (active step only)

```
px-5 pb-5
```

Product cards grid:

- Desktop: `grid grid-cols-2 gap-4`
- Mobile: `grid grid-cols-1 gap-4`

Next button (bottom of body):

```
w-full mt-5 py-3 px-4 bg-blue-600 hover:bg-blue-700
text-white font-medium rounded-xl transition-colors
```

Label: `"Next: {nextCategory.label}"` where nextCategory is the category at stepIndex+1.
On step 4: label is `"Done"`, onClick does nothing, optionally `opacity-50 cursor-default`.

---

## Component breakdown

### Accordion.tsx

- Reads `categories` from store
- Reads `activeStep` from store
- Renders one `<AccordionStep>` per category
- No local state needed

### AccordionStep.tsx

Props:

```ts
interface AccordionStepProps {
  category: Category;
  isActive: boolean;
  onToggle: () => void; // called when header is clicked
  onNext: () => void; // called when Next button is clicked
  nextLabel: string; // "Next: Plan" or "Done"
}
```

- Reads `useSelectedCount(category.stepIndex)` from hook
- Renders header always
- Renders body (ProductCard grid + Next button) only when isActive

---

## Behaviour

- Step 1 open on first render (activeStep starts at 1)
- Clicking a closed step header: `setActiveStep(category.stepIndex)`
- Clicking the currently open step header: `setActiveStep(0)` — collapses all
  (or keep current open, depending on UX preference — document the decision in PR)
- Next button: `setActiveStep(category.stepIndex + 1)`

---

## Tests

1. Step 1 body is visible on render, steps 2–4 bodies are not
2. Clicking step 2 header shows step 2 body
3. "2 selected" badge shows after adding 2 distinct products
4. Next button on step 1 shows step 2
5. Next button on step 4 shows "Done" label

---

## Do NOT

- Animate open/close (no height transitions — keep it simple)
- Put quantity logic in the Accordion
- Import ProductCard data directly — it comes from categories in the store
