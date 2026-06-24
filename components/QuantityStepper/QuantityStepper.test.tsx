import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper', () => {
  it('renders the correct value', () => {
    render(<QuantityStepper value={3} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onIncrement when + is clicked', async () => {
    const onIncrement = vi.fn();
    render(<QuantityStepper value={1} onIncrement={onIncrement} onDecrement={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /increase/i }));
    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it('calls onDecrement when − is clicked and value > 0', async () => {
    const onDecrement = vi.fn();
    render(<QuantityStepper value={2} onIncrement={vi.fn()} onDecrement={onDecrement} />);
    await userEvent.click(screen.getByRole('button', { name: /decrease/i }));
    expect(onDecrement).toHaveBeenCalledOnce();
  });

  it('does NOT call onDecrement when − is clicked and value === 0', async () => {
    const onDecrement = vi.fn();
    render(<QuantityStepper value={0} onIncrement={vi.fn()} onDecrement={onDecrement} />);
    await userEvent.click(screen.getByRole('button', { name: /decrease/i }));
    expect(onDecrement).not.toHaveBeenCalled();
  });

  it('minus button has disabled attribute when value === 0', () => {
    render(<QuantityStepper value={0} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
  });

  it('size sm renders smaller buttons with class w-6', () => {
    render(<QuantityStepper value={1} onIncrement={vi.fn()} onDecrement={vi.fn()} size="sm" />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn.className).toContain('w-6'));
  });
});
