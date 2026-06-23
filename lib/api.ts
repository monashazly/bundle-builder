// lib/api.ts
// The only file that knows where data comes from.
// All fetch() calls live here. Store and components never call fetch() directly.
//
// Currently calls Next.js Route Handlers at /api/*.
// If the backend moves to a separate service, only the URLs here change.

import type { Category, ConfigItem, SaveConfigResponse } from './types';

export interface InitialData {
  categories: Category[];
  initialSingleQty: Record<string, number>;
  initialVariantQty: Record<string, Record<string, number>>;
}

export async function fetchInitialData(): Promise<InitialData> {
  const res = await fetch('/api/products', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  const json = await res.json();
  return json.data as InitialData;
}

export async function saveConfig(items: ConfigItem[]): Promise<SaveConfigResponse> {
  const res = await fetch('/api/configs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`Failed to save config: ${res.status}`);
  const json = await res.json();
  return json.data as SaveConfigResponse;
}

export async function fetchConfig(id: string): Promise<ConfigItem[]> {
  const res = await fetch(`/api/configs/${id}`);
  if (!res.ok) throw new Error(`Config not found: ${id}`);
  const json = await res.json();
  return json.data as ConfigItem[];
}
