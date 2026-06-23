# specs/07-layout.md

## Goal

Wire everything into app/page.tsx and app/layout.tsx.
Correct two-column layout, responsive behaviour, loading/error states.

---

## Files

- `app/layout.tsx` ← root layout, Inter font, metadata
- `app/page.tsx` ← two-column shell, triggers store.init()
- `app/globals.css` ← Tailwind directives only
- `tailwind.config.ts` ← content paths + Inter font extension
- `app/page.test.tsx` ← layout tests

---

## app/layout.tsx

```tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Build Your Security System',
  description: 'Configure your perfect home security bundle.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## app/page.tsx

This is a Server Component. The 'use client' boundary is inside the
child components (Accordion, ReviewPanel etc.).

```tsx
import { BundleBuilder } from '@/components/BundleBuilder/BundleBuilder';

export default function Home() {
  return <BundleBuilder />;
}
```

Create `components/BundleBuilder/BundleBuilder.tsx` as a Client Component
(it needs 'use client' to call store.init() in useEffect):

```tsx
'use client';

export function BundleBuilder() {
  const { init, loading, error } = useBundleStore();

  useEffect(() => {
    init();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={init} />;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            <Accordion />
          </div>
          <div className="w-[380px] flex-shrink-0 sticky top-6">
            <ReviewPanel />
          </div>
        </div>
      </main>
    </>
  );
}
```

---

## Header component

Simple, inline in BundleBuilder or its own file:

```tsx
<header className="bg-gray-900 text-white px-6 py-4">
  <span className="font-semibold text-lg">SecureHome</span>
</header>
```

---

## Responsive layout

Desktop (≥1024px): two columns as shown above.

Tablet (768px–1023px):

- ReviewPanel width: `lg:w-[380px] md:w-[300px]`
- Product cards: 1 column inside accordion

Mobile (<768px):

- Stack: `flex-col` instead of `flex`
- ReviewPanel: full width, no sticky, appears below Accordion
- Use Tailwind responsive prefixes: `flex flex-col lg:flex-row`

Full responsive wrapper:

```tsx
<div className="flex flex-col lg:flex-row gap-8 items-start">
  <div className="w-full lg:flex-1 lg:min-w-0">
    <Accordion />
  </div>
  <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:sticky lg:top-6">
    <ReviewPanel />
  </div>
</div>
```

---

## Loading state

```tsx
function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div
        className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                      rounded-full animate-spin"
      />
    </div>
  );
}
```

---

## Error state

```tsx
function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-gray-600">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## tailwind.config.ts

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Tests (app/page.test.tsx or components/BundleBuilder/BundleBuilder.test.tsx)

Mock the store's init() to resolve immediately with seeded data.

1. LoadingState renders while loading is true
2. ErrorState renders when error is set, retry button calls init()
3. Accordion and ReviewPanel both render after successful load
4. On mobile viewport (375px), ReviewPanel appears below Accordion in DOM order

---

## Do NOT

- Call fetch() in page.tsx — that's the store's job
- Add any business logic to layout files
- Use next/headers or cookies (keep it simple)
