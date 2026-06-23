import { NextResponse } from 'next/server';
import { CATEGORIES, INITIAL_SINGLE_QTY, INITIAL_VARIANT_QTY } from '@/lib/data/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      data: {
        categories: CATEGORIES,
        initialSingleQty: INITIAL_SINGLE_QTY,
        initialVariantQty: INITIAL_VARIANT_QTY,
      },
    },
    { status: 200 }
  );
}
