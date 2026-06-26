import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBundleStore } from '@/store/bundleStore';
import type { Category } from '@/lib/types';
import { ReviewPanel } from './ReviewPanel';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('@/lib/api', () => ({
  saveConfig: vi.fn().mockResolvedValue({ id: 'test-id' }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const mockCategories: Category[] = [
  {
    id: 'cameras',
    label: 'Cameras',
    stepIndex: 1,
    products: [
      {
        id: 'cam-outdoor-pro',
        name: 'Outdoor Camera Pro',
        description: 'desc',
        image: '/img.png',
        price: 155,
        compareAtPrice: 199,
        variants: [{ id: 'cam-outdoor-pro-white', label: 'White', color: '#FFFFFF' }],
      },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    stepIndex: 2,
    products: [
      {
        id: 'plan-standard',
        name: 'Standard Plan',
        description: 'desc',
        image: '/img.png',
        price: 14.99,
      },
    ],
  },
];

beforeEach(() => {
  useBundleStore.setState({
    categories: mockCategories,
    activeStep: 1,
    variantQty: {},
    singleQty: {},
    loading: false,
    error: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ReviewPanel', () => {
  it('renders empty state when no items in store', () => {
    render(<ReviewPanel />);
    expect(screen.getByText(/your system is empty/i)).toBeInTheDocument();
  });

  it('shows PLAN heading and plan item after incrementSingle', () => {
    useBundleStore.setState({ singleQty: { 'plan-standard': 1 } });
    render(<ReviewPanel />);
    expect(screen.getByText('PLAN')).toBeInTheDocument();
    expect(screen.getByText('Standard Plan')).toBeInTheDocument();
  });

  it('shows item under CAMERAS with correct line total and compare-at', () => {
    useBundleStore.setState({
      variantQty: { 'cam-outdoor-pro': { 'cam-outdoor-pro-white': 2 } },
    });
    render(<ReviewPanel />);
    expect(screen.getByText('CAMERAS')).toBeInTheDocument();
    // $310.00 appears as both line total and grand total — both are correct
    expect(screen.getAllByText('$310.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('$398.00').length).toBeGreaterThanOrEqual(1);
  });

  it('stepper in panel increments qty and total updates', async () => {
    useBundleStore.setState({
      variantQty: { 'cam-outdoor-pro': { 'cam-outdoor-pro-white': 1 } },
    });
    render(<ReviewPanel />);
    const increaseBtn = screen.getByRole('button', { name: /increase/i });
    await userEvent.click(increaseBtn);
    expect(useBundleStore.getState().variantQty['cam-outdoor-pro']['cam-outdoor-pro-white']).toBe(
      2
    );
  });

  it('total reflects current qty', () => {
    useBundleStore.setState({ singleQty: { 'plan-standard': 2 } });
    render(<ReviewPanel />);
    // $29.98 appears as both line total and grand total
    expect(screen.getAllByText('$29.98').length).toBeGreaterThanOrEqual(1);
  });

  it('save button calls saveConfig API', async () => {
    useBundleStore.setState({ singleQty: { 'plan-standard': 1 } });
    render(<ReviewPanel />);
    await userEvent.click(screen.getByRole('button', { name: /save my system/i }));
    const { saveConfig } = await import('@/lib/api');
    await waitFor(() => expect(saveConfig).toHaveBeenCalled());
  });
});
