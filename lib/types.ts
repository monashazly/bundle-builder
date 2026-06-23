// lib/types.ts
// Single source of truth for ALL interfaces.
// Imported by both components (client) and Route Handlers (server).
// This is the core advantage of Next.js here — one definition, zero duplication.

// ─── Data model ──────────────────────────────────────────────────────────────

export interface Variant {
  id: string;
  label: string;
  color: string; // hex, e.g. "#FFFFFF"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string; // e.g. "/images/cam-outdoor-pro.png"
  badge?: string; // e.g. "Save 22%" — omit if none
  compareAtPrice?: number; // struck-through price — omit if no discount
  price: number;
  learnMoreUrl?: string;
  variants?: Variant[]; // omit entirely for no-variant products
}

export interface Category {
  id: string;
  label: string; // "Cameras" | "Plan" | "Sensors" | "Add Extra Protection"
  stepIndex: 1 | 2 | 3 | 4;
  products: Product[];
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface ConfigItem {
  productId: string;
  variantId?: string; // omit for no-variant products
  qty: number;
}

export interface SaveConfigRequest {
  items: ConfigItem[];
}

export interface SaveConfigResponse {
  id: string;
}

// ─── Store / UI types ────────────────────────────────────────────────────────

export interface ReviewLineItem {
  product: Product;
  variant?: Variant;
  qty: number;
  linePrice: number; // price * qty
  lineCompareAt?: number; // compareAtPrice * qty
}

export interface BundleTotals {
  subtotal: number; // sum of compareAtPrice * qty (falls back to price)
  total: number; // sum of price * qty
  savings: number; // subtotal - total
}
