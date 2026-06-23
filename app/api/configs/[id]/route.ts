import { NextResponse } from 'next/server';
import { configs } from '../route';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = configs.get(id);

  if (!items) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  }

  return NextResponse.json({ data: items }, { status: 200 });
}
