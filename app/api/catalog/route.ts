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
          include: { variants: true },
        },
      },
    });

    return NextResponse.json({ data: { categories } }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/catalog]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
