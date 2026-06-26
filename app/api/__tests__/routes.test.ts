// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { GET as getConfigs } from '../configs/[id]/route';
import { POST as postConfigs } from '../configs/route';
import { GET as getCatalog } from '../catalog/route';

afterEach(async () => {
  await prisma.config.deleteMany();
});

describe('GET /api/catalog', () => {
  it('returns 200 with a data.categories array of length 4', async () => {
    const res = await getCatalog();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.data.categories)).toBe(true);
    expect(json.data.categories).toHaveLength(4);
  });

  it('each category includes products with variants', async () => {
    const res = await getCatalog();
    const json = await res.json();

    const first = json.data.categories[0];
    expect(Array.isArray(first.products)).toBe(true);
  });
});

describe('POST /api/configs', () => {
  it('returns 201 with a string id for a valid body', async () => {
    const req = new NextRequest('http://localhost/api/configs', {
      method: 'POST',
      body: JSON.stringify({ items: [{ productId: 'cam-outdoor-pro', qty: 1 }] }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await postConfigs(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(typeof json.data.id).toBe('string');
  });

  it('returns 400 for an invalid body', async () => {
    const req = new NextRequest('http://localhost/api/configs', {
      method: 'POST',
      body: JSON.stringify({ items: [{ productId: 123, qty: 'bad' }] }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await postConfigs(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toHaveProperty('error');
  });
});

describe('GET /api/configs/[id]', () => {
  it('returns the items that were POSTed', async () => {
    const items = [{ productId: 'cam-outdoor-pro', qty: 2 }];
    const postReq = new NextRequest('http://localhost/api/configs', {
      method: 'POST',
      body: JSON.stringify({ items }),
      headers: { 'Content-Type': 'application/json' },
    });

    const postRes = await postConfigs(postReq);
    const { data } = await postRes.json();

    const getRes = await getConfigs(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: data.id }),
    });
    const getJson = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getJson.data).toEqual(items);
  });

  it('returns 404 for a nonexistent id', async () => {
    const res = await getConfigs(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'nonexistent' }),
    });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toHaveProperty('error');
  });
});
