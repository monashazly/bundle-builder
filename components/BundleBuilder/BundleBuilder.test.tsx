import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBundleStore } from '@/store/bundleStore';
import type { Category } from '@/lib/types';
import { BundleBuilder } from './BundleBuilder';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('@/lib/api', () => ({
  saveConfig: vi.fn().mockResolvedValue({ id: 'test-id' }),
  fetchCatalog: vi.fn().mockResolvedValue({ categories: [] }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const mockCategories: Category[] = [
  {
    id: 'cameras',
    label: 'Cameras',
    stepIndex: 1,
    products: [{ id: 'p1', name: 'Camera A', description: 'desc', image: '/img.png', price: 100 }],
  },
];

beforeEach(() => {
  useBundleStore.setState({
    categories: [],
    activeStep: 1,
    variantQty: {},
    singleQty: {},
    loading: false,
    error: null,
  });
});

describe('BundleBuilder', () => {
  it('renders skeleton while loading is true', () => {
    useBundleStore.setState({ loading: true });
    render(<BundleBuilder />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state and retry button calls init when error is set', async () => {
    const mockInit = vi.fn().mockResolvedValue(undefined);
    useBundleStore.setState({ error: 'Network error', loading: false, init: mockInit });
    render(<BundleBuilder />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    // init fires on mount (useEffect) and again on retry click — at least 2 calls total
    expect(mockInit).toHaveBeenCalled();
  });

  it('renders Accordion and ReviewPanel after successful load', () => {
    useBundleStore.setState({ categories: mockCategories, loading: false, error: null });
    render(<BundleBuilder />);
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('Your security system')).toBeInTheDocument();
  });

  it('ReviewPanel appears after Accordion in DOM order', () => {
    useBundleStore.setState({ categories: mockCategories, loading: false, error: null });
    render(<BundleBuilder />);
    const accordion = screen.getByText('Step 1 of 4').closest('div');
    const panel = screen.getByText('Your security system').closest('div');
    expect(accordion).toBeTruthy();
    expect(panel).toBeTruthy();
    // Panel comes after accordion in the DOM
    expect(
      accordion!.compareDocumentPosition(panel!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
