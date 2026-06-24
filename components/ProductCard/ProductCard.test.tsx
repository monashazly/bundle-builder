import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBundleStore } from '@/store/bundleStore';
import { ProductCard } from './ProductCard';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const productWithVariants = {
  id: 'cam-outdoor-pro',
  name: 'Outdoor Camera Pro',
  description: '1080p HD, color night vision',
  image: '/images/cam-outdoor-pro.png',
  badge: 'Save 22%',
  compareAtPrice: 199,
  price: 155,
  learnMoreUrl: '#',
  variants: [
    { id: 'cam-outdoor-pro-white', label: 'White', color: '#FFFFFF' },
    { id: 'cam-outdoor-pro-black', label: 'Black', color: '#1F2937' },
  ],
};

const productWithoutVariants = {
  id: 'cam-doorbell',
  name: 'Video Doorbell',
  description: 'HD video, motion detection',
  image: '/images/cam-doorbell.png',
  price: 149,
};

beforeEach(() => {
  useBundleStore.setState({ variantQty: {}, singleQty: {}, categories: [], activeStep: 1 });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProductCard', () => {
  it('renders badge when product.badge is set', () => {
    render(<ProductCard product={productWithVariants} />);
    expect(screen.getByText('Save 22%')).toBeInTheDocument();
  });

  it('does not render badge when product.badge is undefined', () => {
    render(<ProductCard product={productWithoutVariants} />);
    expect(screen.queryByText(/save/i)).not.toBeInTheDocument();
  });

  it('renders VariantSelector for products with variants', () => {
    render(<ProductCard product={productWithVariants} />);
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('does not render VariantSelector for products without variants', () => {
    render(<ProductCard product={productWithoutVariants} />);
    expect(screen.queryByText('White')).not.toBeInTheDocument();
  });

  it('renders Learn More link when learnMoreUrl is set', () => {
    render(<ProductCard product={productWithVariants} />);
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument();
  });

  it('does not render Learn More link when learnMoreUrl is undefined', () => {
    render(<ProductCard product={productWithoutVariants} />);
    expect(screen.queryByRole('link', { name: /learn more/i })).not.toBeInTheDocument();
  });

  it('stepper shows qty=0 initially for a fresh product', () => {
    render(<ProductCard product={productWithVariants} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('switching variant shows that variant qty (add 2 White, switch to Black → 0)', async () => {
    useBundleStore.setState({
      variantQty: { 'cam-outdoor-pro': { 'cam-outdoor-pro-white': 2 } },
    });
    render(<ProductCard product={productWithVariants} />);

    expect(screen.getByText('2')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Black'));

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('card gets selected border when qty > 0', async () => {
    const { container } = render(<ProductCard product={productWithVariants} />);
    await userEvent.click(screen.getByRole('button', { name: /increase/i }));
    expect(container.firstChild).toHaveClass('border-border-selected');
  });

  it('card has default border when all qty === 0', () => {
    const { container } = render(<ProductCard product={productWithVariants} />);
    expect(container.firstChild).toHaveClass('border-border-default');
  });
});
