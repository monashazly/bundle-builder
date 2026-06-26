import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBundleStore } from '@/store/bundleStore';
import type { Category } from '@/lib/types';
import { Accordion } from './Accordion';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockCategories: Category[] = [
  {
    id: 'cameras',
    label: 'Cameras',
    stepIndex: 1,
    products: [
      { id: 'cam-a', name: 'Camera A', description: 'desc', image: '/img.png', price: 100 },
      { id: 'cam-b', name: 'Camera B', description: 'desc', image: '/img.png', price: 120 },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    stepIndex: 2,
    products: [{ id: 'plan-a', name: 'Plan A', description: 'desc', image: '/img.png', price: 50 }],
  },
  {
    id: 'sensors',
    label: 'Sensors',
    stepIndex: 3,
    products: [
      { id: 'sensor-a', name: 'Sensor A', description: 'desc', image: '/img.png', price: 30 },
    ],
  },
  {
    id: 'extras',
    label: 'Add Extra Protection',
    stepIndex: 4,
    products: [
      { id: 'extra-a', name: 'Extra A', description: 'desc', image: '/img.png', price: 60 },
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

describe('Accordion', () => {
  it('step 1 body is visible on render, steps 2–4 bodies are aria-hidden', () => {
    render(<Accordion />);
    // Step 1 body: in DOM and not aria-hidden
    expect(screen.getByText('Camera A')).toBeInTheDocument();
    // Steps 2–4 bodies: kept in DOM for animation but marked aria-hidden
    const hiddenPanels = document.querySelectorAll('[data-accordion-panel][aria-hidden="true"]');
    expect(hiddenPanels.length).toBe(3);
  });

  it('clicking step 2 header shows step 2 body', async () => {
    render(<Accordion />);
    // Header button for step 2 contains "Step 2 of 4"
    await userEvent.click(screen.getByRole('button', { name: /step 2 of 4/i }));
    expect(screen.getByText('Plan A')).toBeInTheDocument();
  });

  it('shows "2 selected" badge when 2 distinct products have qty > 0', () => {
    useBundleStore.setState({ singleQty: { 'cam-a': 1, 'cam-b': 1 } });
    render(<Accordion />);
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('Next button on step 1 opens step 2', async () => {
    render(<Accordion />);
    await userEvent.click(screen.getByRole('button', { name: /next: plan/i }));
    // Step 2 panel is now active (not aria-hidden)
    expect(screen.getByText('Plan A')).toBeInTheDocument();
    // Step 1 panel is now aria-hidden (inactive)
    const hiddenPanels = document.querySelectorAll('[data-accordion-panel][aria-hidden="true"]');
    expect(hiddenPanels.length).toBe(3);
  });

  it('Next button on step 4 shows "Done" label', () => {
    useBundleStore.setState({ activeStep: 4 });
    render(<Accordion />);
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument();
  });
});
