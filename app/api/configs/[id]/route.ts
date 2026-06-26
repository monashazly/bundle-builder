import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const configItemsSchema = z.array(
  z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    qty: z.number(),
  })
);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const config = await prisma.config.findUnique({ where: { id } });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    const parsed = configItemsSchema.safeParse(JSON.parse(config.items));
    if (!parsed.success) {
      console.error('[GET /api/configs/:id] stored data malformed', parsed.error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ data: parsed.data }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/configs/:id]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
