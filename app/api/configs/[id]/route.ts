import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ConfigItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const config = await prisma.config.findUnique({ where: { id } });

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
