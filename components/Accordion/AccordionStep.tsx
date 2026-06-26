'use client';

import { ProductCard } from '@/components/ProductCard';
import { useSelectedCount } from '@/hooks/useBundleStore';
import { cn } from '@/lib/cn';
import type { Category } from '@/lib/types';
import { CameraIcon, CaretDownIcon, CaretUpIcon, ExtrasIcon, PlanIcon, SensorsIcon } from './icons';

const STEP_ICONS: Record<string, () => React.JSX.Element> = {
  cameras: CameraIcon,
  plan: PlanIcon,
  sensors: SensorsIcon,
  extras: ExtrasIcon,
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
  const Icon = STEP_ICONS[category.id] ?? ExtrasIcon;
  const isDone = nextLabel === 'Done';

  return (
    <div className={cn(isActive ? 'bg-secondary-active rounded-[10px] pt-[15px]' : '')}>
      {/* Toggle button */}
      <button
        type="button"
        className="w-full flex flex-col text-left cursor-pointer select-none px-[15px] pt-[5px]"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span
          className={cn(
            'uppercase tracking-[1.6px] text-text-step',
            isActive ? 'text-[12px]' : 'text-[10px]'
          )}
        >
          Step {category.stepIndex} of 4
        </span>

        <div
          className={cn(
            'flex items-center justify-between py-[20px] border-t border-t-[0.5px] border-[#1F1F1F] mt-[5px] -mx-[15px] w-[calc(100%+30px)] px-[15px]',
            !isActive && 'border-b border-b-[0.5px]'
          )}
        >
          <div className="flex flex-1 items-center gap-[8px] min-w-0">
            <span className="flex-shrink-0">
              <Icon />
            </span>
            <span className="flex-1 text-[22px] font-semibold text-text-obsidian leading-none">
              {category.label}
            </span>
          </div>
          <div className="flex items-center gap-[4px] flex-shrink-0">
            {isActive && selectedCount > 0 && (
              <span className="text-[14px] font-medium text-prim-600">
                {selectedCount} selected
              </span>
            )}
            {isActive ? <CaretUpIcon /> : <CaretDownIcon />}
          </div>
        </div>
      </button>

      {/* Animated body — CSS grid row trick gives natural height transition */}
      <div
        data-accordion-panel
        aria-hidden={!isActive}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-[15px] pb-[20px] flex flex-col gap-[15px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-[15px]">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className={cn(
                  'px-[24px] py-[5px] border border-prim-600 rounded-[7px] text-[18px] font-semibold text-prim-600 transition-opacity'
                )}
                onClick={isDone ? onToggle : onNext}
              >
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
