import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBundleStore } from './bundleStore';

vi.mock('@/lib/api', () => ({
  fetchInitialData: vi.fn(),
}));

import { fetchInitialData } from '@/lib/api';

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
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

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
  it('ignores step 0 — step stays at 1', () => {
    useBundleStore.getState().setActiveStep(0);
    expect(useBundleStore.getState().activeStep).toBe(1);
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

describe('localStorage round-trip', () => {
  it('restores variantQty after save and load', () => {
    useBundleStore.getState().incrementVariant('cam-outdoor-pro', 'cam-outdoor-pro-black');
    useBundleStore.getState().saveToLocalStorage();

    useBundleStore.setState({ variantQty: {}, singleQty: {} });

    useBundleStore.getState().loadFromLocalStorage();
    const qty = useBundleStore.getState().variantQty['cam-outdoor-pro']?.['cam-outdoor-pro-black'];
    expect(qty).toBe(1);
  });
});

describe('init()', () => {
  it('sets categories and loading: false on success', async () => {
    vi.mocked(fetchInitialData).mockResolvedValue({
      categories: mockCategories,
      initialSingleQty: {},
      initialVariantQty: {},
    });

    await useBundleStore.getState().init();

    const state = useBundleStore.getState();
    expect(state.categories).toEqual(mockCategories);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets error and loading: false on fetch failure', async () => {
    vi.mocked(fetchInitialData).mockRejectedValue(new Error('Network error'));

    await useBundleStore.getState().init();

    const state = useBundleStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });
});
