## Decisions & tradeoffs

### Framework: Next.js 15 (App Router)

Next.js Route Handlers provide backend in the same repo with zero extra tooling — no separate
server, no CORS config, no second terminal. Frontend and API handlers
share types natively from lib/types.ts.

Tradeoff: most components are interactive (quantity steppers, accordion,
variant selector) so they're 'use client' components anyway — React
Server Components offer limited benefit here. A future team could move
the product catalog to RSC for faster initial render, but it's out of
scope for this take-home.

### State: Zustand

Flat variantQty map (productId → variantId → qty). Both the product
card steppers and the review panel steppers read from the same keys —
sync is automatic, no event bus needed.

### Data layer: lib/api.ts abstraction

Components never import data directly. The store calls api.ts, which
calls the Next.js Route Handler. If the backend moved to a separate
service, only api.ts changes.

### What I didn't finish

- Real product images (colored SVG placeholders)
- Checkout flow (alert placeholder per spec)
- Config restore from server (saves to localStorage + POST /api/configs,
  but GET /api/configs/:id on return visit is not wired up yet)
