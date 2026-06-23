import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ConfigItem } from '@/lib/types';

export const configs = new Map<string, ConfigItem[]>();

const schema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      qty: z.number().int().min(0),
    })
  ),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  configs.set(id, result.data.items);

  return NextResponse.json({ data: { id } }, { status: 201 });
}
