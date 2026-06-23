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
