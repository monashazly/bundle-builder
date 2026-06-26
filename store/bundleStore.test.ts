import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBundleStore } from './bundleStore';

vi.mock('@/lib/api', () => ({
  fetchCatalog: vi.fn(),
}));

import { fetchCatalog } from '@/lib/api';

const mockCategories = [
  {
    id: 'cameras',
    label: 'Cameras',
    stepIndex: 1 as const,
    products: [
      {
        id: 'cam-outdoor-pro',
        name: 'Outdoor Camera Pro',
        description: '',
        image: '',
        price: 155,
        variants: [
          { id: 'cam-outdoor-pro-white', label: 'White', color: '#FFF' },
          { id: 'cam-outdoor-pro-black', label: 'Black', color: '#000' },
        ],
      },
    ],
  },
];

beforeEach(() => {
  useBundleStore.setState({
    categories: [],
    loading: false,
    error: null,
    activeStep: 1,
    variantQty: {},
    singleQty: {},
  });
  vi.clearAllMocks();
});

afterEach(() => {});

describe('decrementVariant', () => {
  it('stays at 0 when qty is already 0', () => {
    useBundleStore.getState().decrementVariant('cam-outdoor-pro', 'cam-outdoor-pro-white');
    const qty =
      useBundleStore.getState().variantQty['cam-outdoor-pro']?.['cam-outdoor-pro-white'] ?? 0;
    expect(qty).toBe(0);
  });
});

describe('decrementSingle', () => {
  it('stays at 0 when qty is already 0', () => {
    useBundleStore.getState().decrementSingle('plan-basic');
    const qty = useBundleStore.getState().singleQty['plan-basic'] ?? 0;
    expect(qty).toBe(0);
  });
});

describe('setActiveStep', () => {
  it('allows step 0 — closes all accordion steps', () => {
    useBundleStore.getState().setActiveStep(0);
    expect(useBundleStore.getState().activeStep).toBe(0);
  });

  it('ignores step 5 — step stays at current value', () => {
    useBundleStore.getState().setActiveStep(5);
    expect(useBundleStore.getState().activeStep).toBe(1);
  });
});

describe('incrementVariant', () => {
  it('creates nested record if it does not exist', () => {
    useBundleStore.getState().incrementVariant('cam-outdoor-pro', 'cam-outdoor-pro-white');
    const qty = useBundleStore.getState().variantQty['cam-outdoor-pro']?.['cam-outdoor-pro-white'];
    expect(qty).toBe(1);
  });
});

describe('init()', () => {
  it('sets categories and loading: false on success', async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({ categories: mockCategories });

    await useBundleStore.getState().init();

    const state = useBundleStore.getState();
    expect(state.categories).toEqual(mockCategories);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets error and loading: false on fetch failure', async () => {
    vi.mocked(fetchCatalog).mockRejectedValue(new Error('Network error'));

    await useBundleStore.getState().init();

    const state = useBundleStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });
});
