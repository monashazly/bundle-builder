'use client';

import { ProductCard } from '@/components/ProductCard';
import { useSelectedCount } from '@/hooks/useBundleStore';
import { cn } from '@/lib/cn';
import type { Category } from '@/lib/types';
import { Camera, ChevronDown, ChevronUp, Plus, Shield, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STEP_ICONS: Record<string, LucideIcon> = {
  cameras: Camera,
  plan: Shield,
  sensors: Wifi,
  extras: Plus,
};

interface AccordionStepProps {
  category: Category;
  isActive: boolean;
  onToggle: () => void;
  onNext: () => void;
  nextLabel: string;
}

export function AccordionStep({
  category,
  isActive,
  onToggle,
  onNext,
  nextLabel,
}: AccordionStepProps) {
  const selectedCount = useSelectedCount(category.stepIndex);
  const Icon = STEP_ICONS[category.id] ?? Plus;
  const isDone = nextLabel === 'Done';

  return (
    <div
      className={cn(
        'bg-surface-card rounded-2xl border shadow-sm overflow-hidden',
        isActive ? 'border-brand-600' : 'border-border-default'
      )}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-surface-subtle text-left"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span className="text-xs font-medium uppercase tracking-widest text-text-muted whitespace-nowrap">
          Step {category.stepIndex} of 4
        </span>
        <Icon size={20} className="text-text-muted flex-shrink-0" />
        <span className="text-base font-medium text-text-primary">{category.label}</span>

        <div className="flex items-center gap-2 ml-auto">
          {isActive && selectedCount > 0 && (
            <span className="text-sm bg-gray-100 text-text-muted px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {selectedCount} selected
            </span>
          )}
          {isActive ? (
            <ChevronUp size={18} className="text-text-muted flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-text-muted flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Body — only rendered when active */}
      {isActive && (
        <div className="bg-surface-active px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <button
            type="button"
            className={cn(
              'w-full mt-5 py-3 px-4 text-text-on-brand font-medium rounded-xl transition-colors',
              isDone ? 'bg-brand-600 opacity-50 cursor-default' : 'bg-brand-600 hover:bg-brand-700'
            )}
            onClick={isDone ? undefined : onNext}
            disabled={isDone}
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
