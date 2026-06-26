# Bundle Builder

## Overview

A multi-step security system bundle builder built with Next.js 15 App Router. Users configure a home security system through a 4-step accordion (cameras → plan → sensors → extras) while a live review panel on the right reflects every quantity change in real time. The app pre-populates with a recommended starting configuration on first load and persists the user's selection to localStorage across sessions.

---

## Run instructions

```bash
npm install
npm run dev      # http://localhost:3000 — database is created and seeded automatically
npm run test     # Vitest unit tests
npm run build    # production build
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run lint:fix    # ESLint + auto-fix
npm run format      # Prettier write
```

---

## Architecture

### Framework

Next.js 15 App Router with React 18. `app/page.tsx` is a Server Component — the `'use client'` boundary starts at `BundleBuilder`, which is the only component that calls `store.init()`. All interactive leaf components (`Accordion`, `ReviewPanel`, `ProductCard`, etc.) are Client Components.

### State management

Zustand holds all mutable state: `categories` (server data), `activeStep`, `variantQty` (per-product per-variant quantities), and `singleQty` (quantities for no-variant products). No `useState` for quantities anywhere — all qty reads and writes go through the store. `selectedVariantId` in `ProductCard` is the only local state allowed, because it is UI-only and does not affect the review panel.

### Data layer isolation

`lib/api.ts` is the only file that knows about API endpoint URLs. The store calls `fetchInitialData()` and `saveConfig()` from `lib/api.ts`; components never call `fetch()` directly. If the backend moves to a separate service, only the URLs in `lib/api.ts` change.

### Shared types across frontend and Route Handlers

`lib/types.ts` is imported by both React components (client) and Next.js Route Handlers (server). This is the main advantage of co-locating the API inside Next.js — one `Product`, `Category`, and `ConfigItem` definition with zero duplication.

---

## API endpoints

| Method | Path               | Description                                                   |
| ------ | ------------------ | ------------------------------------------------------------- |
| `GET`  | `/api/products`    | Returns all categories with products and pre-seeded qty state |
| `POST` | `/api/configs`     | Saves a bundle configuration, returns `{ id }`                |
| `GET`  | `/api/configs/:id` | Retrieves a previously saved configuration by ID              |

All responses follow `{ data: T }` on success and `{ error: string }` on failure. Configs are persisted to SQLite via Prisma and survive server restarts.

---

## Decisions & tradeoffs

**Next.js over plain React.** The spec required a backend — `POST /api/configs` to persist bundles and `GET /api/configs/:id` to retrieve them. Next.js Route Handlers provide that inside the same repo with shared TypeScript types (`lib/types.ts`) and zero duplication between client and server code. With plain React you would need a separate Express/Fastify server, a separate deploy, and duplicated type definitions.

The honest tradeoff: Next.js is overkill for the UI itself. The bundle builder is 100% client-side (Zustand state, no SSR data fetching, no SEO requirements), so a Vite + React SPA would have been simpler and faster to develop. The `'use client'` boundary on every interactive component, the App Router mental model, and the Server Component constraints all add complexity that a pure SPA doesn't need. Next.js was the right call only because the backend had to live somewhere.

**Plus Jakarta Sans instead of Gilroy.** The Figma design uses Gilroy (by Radomir Tinkov), a geometric sans-serif. Gilroy is a commercial font — it is not available on Google Fonts and requires a paid license from Fontfabric. Plus Jakarta Sans is the closest free alternative: same geometric construction, similar weight distribution, and available via `next/font/google` with no license overhead. The visual difference is minimal at the font sizes used in this UI.

**Tailwind v4 instead of v3.** `create-next-app` scaffolds with v4 by default. Rather than downgrading, the project uses v4's `@theme` block in `globals.css` for all design tokens, making them available as Tailwind utilities. There is no `tailwind.config.ts`.

**Zustand over Context + useReducer.** The review panel and product cards must stay in sync without prop drilling. Zustand lets any leaf component read exactly the slice it needs (`variantQty[productId][variantId]`) without re-rendering unrelated components.

## Database

SQLite via Prisma. No server, no account, no Docker — just a local file at `prisma/dev.db`. The same schema and queries work with PostgreSQL or MySQL in production by changing one line in `prisma/schema.prisma` and updating `DATABASE_URL`.

### Setup

The database is created and seeded automatically on first `npm run dev`. No extra steps needed.

To reset or re-seed manually:

```bash
npm run db:setup    # create tables + seed product data
npm run db:reset    # wipe and re-seed from scratch
```

### Browse the database

```bash
npm run db:studio   # opens Prisma Studio at http://localhost:5555
```

Prisma Studio is a visual table browser built into Prisma. No extra tools needed.

Tables:

| Table      | Description                                            |
| ---------- | ------------------------------------------------------ |
| `Category` | The 4 accordion steps (Cameras, Plan, Sensors, Extras) |
| `Product`  | All 14 products with prices, badges, and image paths   |
| `Variant`  | Color variants (White/Black) for camera products       |
| `Config`   | Saved bundle configurations (items stored as JSON)     |

### Database scripts

| Command             | What it does                             |
| ------------------- | ---------------------------------------- |
| `npm run db:setup`  | Run migrations + seed (first-time setup) |
| `npm run db:reset`  | Wipe database and re-seed from scratch   |
| `npm run db:seed`   | Re-seed without dropping tables          |
| `npm run db:studio` | Visual browser at http://localhost:5555  |
