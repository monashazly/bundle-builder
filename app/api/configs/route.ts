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
      data: { items: JSON.stringify(result.data.items) },
    });

    return NextResponse.json({ data: { id: config.id } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/configs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
