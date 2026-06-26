---
name: nextjs-api-routes
description: Rules and templates for building Next.js 15 App Router Route Handlers. Use this skill before creating or editing any file under app/api/ — including route.ts files, Zod validation schemas, and API error responses. Trigger whenever the user mentions Route Handlers, API endpoints, app/api, POST/GET handlers, or request validation in a Next.js project.
---

# Next.js App Router API Routes

## When to use this skill

Read this skill before building ANY of the following:

- A Next.js Route Handler (`app/api/**/route.ts`)
- A Zod validation schema for an API body
- An API error response
- Any file inside `app/api/`

For anything that queries the database, ALSO read:
`.claude/skills/prisma-sqlite/SKILL.md`

---

## Project context

Stack: Next.js 15, App Router, TypeScript strict mode, Zod for validation,
Prisma + SQLite for the database.
All types live in `lib/types.ts` — import from there, never redefine.
All Route Handlers live under `app/api/`.
Database client: always import from `@/lib/prisma` — never instantiate directly.

---

## Rule 1 — File naming

Every Route Handler must be named exactly `route.ts`.

```
app/
  api/
    products/
      route.ts          ← GET /api/products
    configs/
      route.ts          ← POST /api/configs
      [id]/
        route.ts        ← GET /api/configs/:id
```

No other filename works. `handler.ts`, `index.ts` are ignored by Next.js.

---

## Rule 2 — Response envelope (non-negotiable)

Every response — success or error — uses this envelope:

```ts
// Success
{
  data: T;
}

// Error
{
  error: string;
}
```

Never return a raw array or raw object at the top level.

```ts
// ✅ correct
return NextResponse.json({ data: categories }, { status: 200 });

// ❌ wrong — raw array
return NextResponse.json(categories, { status: 200 });

// ❌ wrong — no envelope
return NextResponse.json({ categories }, { status: 200 });
```

---

## Rule 3 — Status codes

| Situation                        | Status |
| -------------------------------- | ------ |
| GET success                      | 200    |
| POST success (created something) | 201    |
| Zod validation failure           | 400    |
| Resource not found               | 404    |
| Unexpected server error          | 500    |

---

## Rule 4 — Always use NextResponse.json()

Never use `new Response()` directly. Always `NextResponse.json()`.

```ts
import { NextResponse } from 'next/server';

// ✅
return NextResponse.json({ data: result }, { status: 200 });

// ❌
return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
```

---

## Rule 5 — Validate every POST body with Zod

Never trust `req.json()` directly. Always parse with Zod first.
Use `safeParse` — never `parse` (throws on failure, hard to handle cleanly).
Always type the raw body as `unknown` before parsing.

```ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        qty: z.number().int().min(0),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const body: unknown = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const { items } = result.data;
  // items is now fully typed — safe to use
}
```

---

## Rule 6 — Prevent caching on dynamic routes

Add this export to every Route Handler:

```ts
export const dynamic = 'force-dynamic';
```

Without it, Next.js may cache the GET response and serve stale data.
This must be present in every file under `app/api/`.

---

## Rule 7 — Wrap every handler in try/catch

Every handler must catch unexpected errors and return 500, never crash.
Log the error server-side with context so it's debuggable.

```ts
export async function GET() {
  try {
    // ... handler logic
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Rule 8 — Type the request and params correctly

```ts
import { NextRequest, NextResponse } from 'next/server'

// GET with no params — prefix unused req with underscore
export async function GET(_req: NextRequest) { ... }

// GET with dynamic segment [id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) { ... }

// POST with body
export async function POST(req: NextRequest) {
  const body: unknown = await req.json()
  // always validate with Zod before using body
}
```

---

## Rule 9 — Never import browser APIs or Zustand in route handlers

Route Handlers run on the server. These will throw or silently fail:

```ts
// ❌ will crash the server
import { useBundleStore } from '@/store/bundleStore'
localStorage.setItem(...)
window.location...
```

Route Handlers only import from:

- `next/server` (NextRequest, NextResponse)
- `zod`
- `lib/types.ts`
- `@/lib/prisma` (database client)
- Node.js built-ins (`crypto`, `process`)

---

## Rule 10 — No business logic in Route Handlers

Route Handlers are thin. They do three things only:

1. Validate input (Zod)
2. Call the database (Prisma)
3. Return the response (NextResponse)

If logic grows beyond this, extract it to a service function in `lib/services/`.

```ts
// ❌ too much logic in the handler
export async function POST(req: NextRequest) {
  const body: unknown = await req.json();
  // ... 50 lines of business logic
}

// ✅ handler stays thin
import { createConfig } from '@/lib/services/config';

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }
    const config = await createConfig(result.data.items);
    return NextResponse.json({ data: { id: config.id } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/configs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Complete Route Handler templates

### GET /api/products — fetch all categories with relations

```ts
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { stepIndex: 'asc' },
      include: {
        products: {
          orderBy: { position: 'asc' },
          include: {
            variants: true,
          },
        },
      },
    });

    return NextResponse.json({ data: { categories } }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### POST /api/configs — save a bundle configuration

```ts
// app/api/configs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const configSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        qty: z.number().int().min(0),
      })
    )
    .min(1, 'At least one item is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const result = configSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

    const config = await prisma.config.create({
      data: {
        items: JSON.stringify(result.data.items),
      },
    });

    return NextResponse.json({ data: { id: config.id } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/configs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### GET /api/configs/[id] — retrieve a saved configuration

```ts
// app/api/configs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ConfigItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const config = await prisma.config.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    const items = JSON.parse(config.items) as ConfigItem[];

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/configs/:id]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Testing Route Handlers with Vitest

Import the handler function directly — never `fetch()` against a live server.
Use a test database (see `prisma-sqlite` skill for test DB setup).

```ts
// app/api/products/route.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/products', () => {
  it('returns 200 with data envelope', async () => {
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.categories).toBeDefined();
  });

  it('categories are ordered by stepIndex', async () => {
    const res = await GET();
    const json = await res.json();
    const steps = json.data.categories.map((c: { stepIndex: number }) => c.stepIndex);
    expect(steps).toEqual([1, 2, 3, 4]);
  });
});
```

```ts
// app/api/configs/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST } from './route';

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/configs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/configs', () => {
  beforeEach(async () => {
    await prisma.config.deleteMany();
  });

  it('returns 201 with an id for valid body', async () => {
    const res = await POST(
      makePostRequest({
        items: [{ productId: 'cam-outdoor-pro', variantId: 'cam-outdoor-pro-white', qty: 2 }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(typeof json.data.id).toBe('string');
    expect(json.data.id.length).toBeGreaterThan(0);
  });

  it('returns 400 for empty items array', async () => {
    const res = await POST(makePostRequest({ items: [] }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('returns 400 for missing items field', async () => {
    const res = await POST(makePostRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('persists config to database', async () => {
    const res = await POST(
      makePostRequest({
        items: [{ productId: 'sensor-door', qty: 2 }],
      })
    );
    const json = await res.json();

    const saved = await prisma.config.findUnique({ where: { id: json.data.id } });
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved!.items)).toHaveLength(1);
  });
});
```

---

## Checklist before committing any Route Handler

- [ ] File is named `route.ts` exactly
- [ ] `export const dynamic = 'force-dynamic'` present
- [ ] Response uses `{ data: T }` or `{ error: string }` envelope
- [ ] Every POST body typed as `unknown` then validated with Zod `safeParse`
- [ ] Handler wrapped in try/catch returning 500 on error
- [ ] No browser APIs, no Zustand imports
- [ ] Imports `prisma` from `@/lib/prisma` — never `new PrismaClient()`
- [ ] Co-located `route.test.ts` written and passing
- [ ] `npm run typecheck` clean
- [ ] `npm run test` passing
