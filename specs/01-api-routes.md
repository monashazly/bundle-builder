# specs/01-api-routes.md

## Goal

Build the two Next.js Route Handlers that serve as the backend.
These are server-only files. Never import Zustand or browser APIs here.

---

## Files

- `app/api/products/route.ts`
- `app/api/configs/route.ts`
- `app/api/configs/[id]/route.ts`

---

## GET /api/products

File: `app/api/products/route.ts`

Returns all categories, products, and variants, plus the initial qty seed.

```ts
// Response shape
{
  data: {
    categories: Category[];
    initialSingleQty: Record<string, number>;
    initialVariantQty: Record<string, Record<string, number>>;
  }
}
```

Implementation:

- Import CATEGORIES, INITIAL_SINGLE_QTY, INITIAL_VARIANT_QTY from lib/data/products.ts
- Return them wrapped in { data: { categories, initialSingleQty, initialVariantQty } }
- Use NextResponse.json() with status 200
- Add `export const dynamic = 'force-dynamic'` to prevent Next.js caching

---

## POST /api/configs

File: `app/api/configs/route.ts`

Saves a bundle configuration. Uses an in-memory store (module-level Map).

Request body:

```ts
{ items: ConfigItem[] }
// ConfigItem = { productId: string; variantId?: string; qty: number }
```

Response:

```ts
{
  data: {
    id: string;
  }
}
```

Implementation:

- Validate body with Zod:
  ```ts
  const schema = z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        qty: z.number().int().min(0),
      })
    ),
  });
  ```
- On validation failure: return { error: 'Invalid request body' } with status 400
- Generate id with `crypto.randomUUID()`
- Store in module-level `const configs = new Map<string, ConfigItem[]>()`
- Also persist to localStorage is NOT possible server-side — that's client only.
  The server just stores in memory. Client handles localStorage separately.
- Return { data: { id } } with status 201

---

## GET /api/configs/[id]

File: `app/api/configs/[id]/route.ts`

Retrieves a saved configuration by id.

Response on success:

```ts
{ data: ConfigItem[] }
```

Response on not found:

```ts
{
  error: 'Config not found';
} // status 404
```

Implementation:

- Read id from params
- Look up in the same module-level Map from configs/route.ts
  (export the Map from configs/route.ts and import it in [id]/route.ts)
- Return 404 if not found

---

## Tests (app/api/**tests**/routes.test.ts)

Use Vitest. Mock NextRequest/NextResponse or use fetch against a test server.

1. GET /api/products returns 200 with data.categories array of length 4
2. GET /api/products response includes initialSingleQty and initialVariantQty
3. POST /api/configs with valid body returns 201 with a string id
4. POST /api/configs with invalid body returns 400
5. GET /api/configs/:id returns the items that were POSTed
6. GET /api/configs/nonexistent returns 404

---

## Do NOT

- Add a database
- Add authentication
- Add rate limiting
- Use next/headers for anything — keep it simple
